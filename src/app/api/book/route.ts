import { z } from 'zod'
import configPromise from '@payload-config'
import { bookingHold } from '@/lib/redis'
import { getPayload } from 'payload'

const requestSchema = z
  .object({
    serviceId: z.string({ required_error: 'serviceId is required' }).min(1, 'serviceId is required'),
    slot: z
      .string({ required_error: 'slot is required' })
      .datetime({ message: 'slot must be an ISO 8601 date string' }),
    clientId: z.string({ required_error: 'clientId is required' }).min(1, 'clientId is required'),
    providerId: z.string().min(1).optional(),
    status: z
      .enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
      .optional()
      .default('confirmed'),
    timeZone: z.string().optional().default('UTC'),
    clientNotes: z.string().max(2000).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict()

const buildValidationErrorResponse = (issues: z.ZodIssue[]): Response =>
  Response.json(
    {
      message: 'Invalid request',
      errors: issues.map((issue) => ({
        path: issue.path.join('.') || 'root',
        message: issue.message,
      })),
    },
    { status: 400 },
  )

type RawService = Record<string, unknown> & {
  isActive?: boolean | null
  leadTimeHours?: number | null
  providers?: unknown
  durationMinutes?: number | null
  bufferMinutesBefore?: number | null
  bufferMinutesAfter?: number | null
  pricing?: Record<string, unknown> | null
}

const ensureServiceIsBookable = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  serviceId: string,
) => {
  try {
    const service = (await payload.findByID({
      collection: 'services',
      id: serviceId,
      depth: 0,
    })) as RawService | null

    if (!service || typeof service !== 'object') {
      return { service: null, errors: ['SERVICE_NOT_FOUND'] as const }
    }

    if (service.isActive === false) {
      return { service, errors: ['SERVICE_INACTIVE'] as const }
    }

    return { service, errors: [] as const }
  } catch (error) {
    const notFound =
      typeof error === 'object' && error !== null && 'status' in error && (error as { status?: number }).status === 404

    if (notFound) {
      return { service: null, errors: ['SERVICE_NOT_FOUND'] as const }
    }

    throw error
  }
}

const extractProviderIdFromService = (service: RawService, requestedProviderId?: string) => {
  if (requestedProviderId) return requestedProviderId

  const providers = Array.isArray(service.providers) ? (service.providers as unknown[]) : []
  if (providers.length === 1) {
    const [onlyProvider] = providers
    if (onlyProvider && typeof onlyProvider === 'object') {
      if ('value' in onlyProvider && typeof (onlyProvider as { value?: unknown }).value === 'string') {
        return (onlyProvider as { value?: unknown }).value
      }
      if ('id' in onlyProvider && typeof (onlyProvider as { id?: unknown }).id === 'string') {
        return (onlyProvider as { id?: unknown }).id
      }
    }
  }

  return null
}

export const dynamic = 'force-dynamic'

export const POST = async (request: Request): Promise<Response> => {
  let payload
  try {
    payload = await getPayload({
      config: configPromise,
    })
  } catch (error) {
    console.error('Failed to initialize Payload instance for booking route', error)
    return Response.json(
      {
        message: 'Failed to initialize backend services',
      },
      { status: 500 },
    )
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return Response.json(
      {
        message: 'Invalid request',
        errors: [{ path: 'body', message: 'Request body must be valid JSON' }],
      },
      { status: 400 },
    )
  }
  const parsed = requestSchema.safeParse(rawBody)

  if (!parsed.success) {
    return buildValidationErrorResponse(parsed.error.issues)
  }

  const { serviceId, slot, clientId, providerId, status, timeZone, clientNotes, metadata } = parsed.data

  const slotDate = new Date(slot)
  if (Number.isNaN(slotDate.getTime())) {
    return Response.json(
      {
        message: 'Invalid request',
        errors: [{ path: 'slot', message: 'slot must be a valid date' }],
      },
      { status: 400 },
    )
  }

  const normalizedSlot = slotDate.toISOString()

  const { service, errors: serviceErrors } = await ensureServiceIsBookable(payload, serviceId)

  if (!service) {
    return Response.json(
      {
        message: 'Unable to confirm booking',
        reasons: serviceErrors.length > 0 ? serviceErrors : ['SERVICE_NOT_FOUND'],
      },
      { status: 404 },
    )
  }

  const resolvedProviderId = extractProviderIdFromService(service, providerId)

  if (!resolvedProviderId) {
    return Response.json(
      {
        message: 'Unable to confirm booking',
        reasons: ['PROVIDER_REQUIRED'],
      },
      { status: 409 },
    )
  }

  try {
    const existingAppointment = await payload.find({
      collection: 'appointments',
      where: {
        and: [
          { service: { equals: serviceId } },
          { 'schedule.start': { equals: normalizedSlot } },
        ],
      },
      depth: 0,
      limit: 1,
    })

    if (existingAppointment.docs.length > 0) {
      return Response.json(
        {
          message: 'Unable to confirm booking',
          reasons: ['ALREADY_BOOKED'],
        },
        { status: 409 },
      )
    }
  } catch (error) {
    payload.logger.error?.('Failed to check existing appointments before booking', error)
    return Response.json(
      {
        message: 'Unable to confirm booking',
      },
      { status: 500 },
    )
  }

  let hold
  try {
    hold = await bookingHold.get({ serviceId, slot: normalizedSlot })
  } catch (error) {
    payload.logger.error?.('Failed to read booking hold before booking', error)
    return Response.json(
      {
        message: 'Unable to confirm booking',
      },
      { status: 500 },
    )
  }

  if (!hold || hold.ttlSeconds <= 0) {
    return Response.json(
      {
        message: 'Unable to confirm booking',
        reasons: ['HOLD_NOT_FOUND'],
      },
      { status: 409 },
    )
  }

  if (hold.customerId && hold.customerId !== clientId) {
    return Response.json(
      {
        message: 'Unable to confirm booking',
        reasons: ['HOLD_RESERVED_FOR_DIFFERENT_CUSTOMER'],
      },
      { status: 409 },
    )
  }

  if (hold.providerId && hold.providerId !== resolvedProviderId) {
    return Response.json(
      {
        message: 'Unable to confirm booking',
        reasons: ['HOLD_RESERVED_FOR_DIFFERENT_PROVIDER'],
      },
      { status: 409 },
    )
  }

  const durationMinutes = typeof service.durationMinutes === 'number' ? service.durationMinutes : 0
  const end = new Date(slotDate.getTime() + Math.max(durationMinutes, 0) * 60 * 1000).toISOString()

  const bufferBefore = typeof service.bufferMinutesBefore === 'number' ? service.bufferMinutesBefore : 0
  const bufferAfter = typeof service.bufferMinutesAfter === 'number' ? service.bufferMinutesAfter : 0
  const pricing = typeof service.pricing === 'object' && service.pricing !== null ? service.pricing : {}

  try {
    const appointment = await payload.create({
      collection: 'appointments',
      data: {
        client: clientId,
        provider: resolvedProviderId,
        service: serviceId,
        status,
        schedule: {
          start: normalizedSlot,
          end,
          timeZone: timeZone ?? 'UTC',
          bufferBefore,
          bufferAfter,
        },
        pricingSnapshot: {
          amount: typeof (pricing as { amount?: unknown }).amount === 'number' ? pricing.amount : 0,
          currency: typeof (pricing as { currency?: unknown }).currency === 'string' ? pricing.currency : 'USD',
          durationMinutes: durationMinutes > 0 ? durationMinutes : Math.max(Math.round((new Date(end).getTime() - slotDate.getTime()) / 60000), 0),
          taxRate: typeof (pricing as { taxRate?: unknown }).taxRate === 'number' ? pricing.taxRate : undefined,
        },
        clientNotes,
        metadata,
      },
    })

    try {
      await bookingHold.release({ serviceId, slot: normalizedSlot })
    } catch (error) {
      payload.logger.warn?.('Appointment created but failed to release hold', error)
    }

    return Response.json(
      {
        message: 'Booking confirmed',
        appointment: {
          id: appointment.id,
          reference: appointment.reference,
          status: appointment.status,
          schedule: appointment.schedule,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    payload.logger.error?.('Failed to create appointment', error)
    return Response.json(
      {
        message: 'Unable to confirm booking',
      },
      { status: 500 },
    )
  }
}
