import type { ZodIssue } from 'zod'
import { sql } from 'drizzle-orm'
import configPromise, { payloadDrizzle } from '@payload-config'
import { bookingHold } from '@/lib/redis'
import { bookingHoldRequestSchema } from '@/lib/schemas/booking'
import { getPayload } from 'payload'

const buildValidationErrorResponse = (issues: ZodIssue[]): Response =>
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

const assertProviderBelongsToService = (service: RawService, providerId?: string): boolean => {
  if (!providerId) return true
  const providers = Array.isArray(service?.providers) ? (service.providers as unknown[]) : []
  return providers.some((provider) => {
    if (!provider || typeof provider !== 'object') return false

    if ('value' in provider && typeof (provider as { value?: unknown }).value === 'string') {
      return (provider as { value?: unknown }).value === providerId
    }

    if ('id' in provider && typeof (provider as { id?: unknown }).id === 'string') {
      return (provider as { id?: unknown }).id === providerId
    }

    return false
  })
}

export const dynamic = 'force-dynamic'

export const POST = async (request: Request): Promise<Response> => {
  let payload
  try {
    payload = await getPayload({
      config: configPromise,
    })
  } catch (error) {
    console.error('Failed to initialize Payload instance for booking hold route', error)
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
  const parsed = bookingHoldRequestSchema.safeParse(rawBody)

  if (!parsed.success) {
    return buildValidationErrorResponse(parsed.error.issues)
  }

  const { serviceId, slot, ttlSeconds, customerId, providerId, metadata } = parsed.data
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
        message: 'Unable to create booking hold',
        reasons: serviceErrors.length > 0 ? serviceErrors : ['SERVICE_NOT_FOUND'],
      },
      { status: 404 },
    )
  }

  const now = new Date()
  if (slotDate.getTime() < now.getTime()) {
    return Response.json(
      {
        message: 'Unable to create booking hold',
        reasons: ['PAST_SLOT'],
      },
      { status: 409 },
    )
  }

  const leadTimeHours = typeof service.leadTimeHours === 'number' ? service.leadTimeHours : null
  if (leadTimeHours && leadTimeHours > 0) {
    const minStart = new Date(now.getTime() + leadTimeHours * 60 * 60 * 1000)
    if (slotDate.getTime() < minStart.getTime()) {
      return Response.json(
        {
          message: 'Unable to create booking hold',
          reasons: ['LEAD_TIME_NOT_MET'],
        },
        { status: 409 },
      )
    }
  }

  if (!assertProviderBelongsToService(service, providerId)) {
    return Response.json(
      {
        message: 'Unable to create booking hold',
        reasons: ['PROVIDER_NOT_AVAILABLE_FOR_SERVICE'],
      },
      { status: 409 },
    )
  }

  try {
    const existingAppointment = await payloadDrizzle.execute(
      sql`select 1 from "appointments" where "service" = ${serviceId} and ("schedule"->>'start') = ${normalizedSlot} limit 1`,
    )

    if (Array.isArray(existingAppointment?.rows) && existingAppointment.rows.length > 0) {
      return Response.json(
        {
          message: 'Unable to create booking hold',
          reasons: ['ALREADY_BOOKED'],
        },
        { status: 409 },
      )
    }
  } catch (error) {
    payload.logger.error?.('Failed to check existing appointments before creating hold', error)
    return Response.json(
      {
        message: 'Unable to create booking hold',
      },
      { status: 500 },
    )
  }

  try {
    const existingHold = await bookingHold.get({ serviceId, slot: normalizedSlot })
    if (existingHold && existingHold.ttlSeconds > 0) {
      return Response.json(
        {
          message: 'Unable to create booking hold',
          reasons: ['ALREADY_ON_HOLD'],
          hold: existingHold,
        },
        { status: 409 },
      )
    }
  } catch (error) {
    payload.logger.error?.('Failed to read existing booking hold', error)
    return Response.json(
      {
        message: 'Unable to create booking hold',
      },
      { status: 500 },
    )
  }

  try {
    const hold = await bookingHold.create({
      serviceId,
      slot: normalizedSlot,
      ttlSeconds,
      details: {
        customerId,
        providerId,
        metadata,
      },
    })

    return Response.json(
      {
        message: 'Booking hold created',
        hold,
      },
      { status: 201 },
    )
  } catch (error) {
    payload.logger.error?.('Failed to create booking hold', error)
    return Response.json(
      {
        message: 'Unable to create booking hold',
      },
      { status: 500 },
    )
  }
}
