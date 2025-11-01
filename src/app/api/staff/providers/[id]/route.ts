import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ZodError, z } from 'zod'

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth'
import { extractRoles } from '@/lib/auth'
import { mapProviderDocToStaffProvider } from '@/lib/staff/utils/mapProvider'
import type { Provider as ProviderDoc } from '@/payload-types'

export const dynamic = 'force-dynamic'

const DAY_VALUES = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.NaN
  }
  return hours * 60 + minutes
}

const windowSchema = z
  .object({
    day: z.enum(DAY_VALUES),
    startTime: z
      .string({ required_error: 'Start time is required' })
      .regex(TIME_PATTERN, 'Invalid start time'),
    endTime: z
      .string({ required_error: 'End time is required' })
      .regex(TIME_PATTERN, 'Invalid end time'),
  })
  .refine((value) => toMinutes(value.endTime) > toMinutes(value.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

const updateSchema = z.object({
  windows: z.array(windowSchema, { invalid_type_error: 'Windows must be an array' }),
})

const buildAvailabilityPayload = (
  provider: ProviderDoc,
  windows: Array<z.infer<typeof windowSchema>>,
) => {
  const defaultDuration = provider?.availability?.defaultDurationMinutes

  return {
    availability: {
      ...(typeof defaultDuration === 'number' ? { defaultDurationMinutes: defaultDuration } : {}),
      windows: windows.map((window) => ({
        day: window.day,
        startTime: window.startTime,
        endTime: window.endTime,
      })),
    },
  }
}

const canEditProvider = (
  roles: string[],
  userId: string,
  providerAccountId: string,
): boolean => {
  if (roles.includes('admin') || roles.includes('receptionist')) {
    return true
  }

  if (roles.includes('doctor') && providerAccountId && providerAccountId === userId) {
    return true
  }

  return false
}

export const PATCH = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  const { id } = await context.params
  const { payload, user } = await authenticateStaffRequest(request)

  if (!user) {
    return unauthorizedResponse()
  }

  let body: z.infer<typeof updateSchema>

  try {
    const json = await request.json()
    body = updateSchema.parse(json)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: 'Invalid request body',
          issues: error.flatten(),
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        message: 'Invalid JSON body',
      },
      { status: 400 },
    )
  }

  let provider: ProviderDoc

  try {
    provider = (await payload.findByID({
      collection: 'providers',
      id,
      depth: 1,
      overrideAccess: true,
    })) as ProviderDoc
  } catch (error) {
    payload.logger.warn?.('Provider not found when updating availability', error)
    return NextResponse.json(
      {
        message: 'Provider not found',
      },
      { status: 404 },
    )
  }

  const staffProvider = mapProviderDocToStaffProvider(provider)
  const roles = extractRoles(user)
  const userId = String(user.id ?? '')

  if (!canEditProvider(roles, userId, staffProvider.accountId)) {
    return NextResponse.json(
      {
        message: 'Forbidden',
      },
      { status: 403 },
    )
  }

  const payloadData = buildAvailabilityPayload(provider, body.windows)

  try {
    const updated = await payload.update({
      collection: 'providers',
      id,
      data: payloadData,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({
      provider: mapProviderDocToStaffProvider(updated as ProviderDoc),
    })
  } catch (error) {
    payload.logger.error?.('Failed to update provider availability', error)
    return NextResponse.json(
      {
        message: 'Unable to update provider availability',
      },
      { status: 500 },
    )
  }
}
