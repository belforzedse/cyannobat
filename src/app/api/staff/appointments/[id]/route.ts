import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ZodError, z } from 'zod'

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth'
import type { StaffAppointment } from '@/lib/staff/types'

type RelationRecord = { [key: string]: unknown }

const STATUS_VALUES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as const

const getRelationDoc = (relation: unknown): RelationRecord | null => {
  if (!relation || typeof relation !== 'object') {
    return null
  }

  const record = relation as RelationRecord

  if ('relationTo' in record && 'value' in record) {
    const value = record.value
    return value && typeof value === 'object' ? (value as RelationRecord) : null
  }

  return record
}

const toISODateString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString()
  }

  return new Date().toISOString()
}

const mapAppointment = (doc: unknown): StaffAppointment => {
  const record = typeof doc === 'object' && doc !== null ? (doc as Record<string, unknown>) : {}
  const schedule = typeof record.schedule === 'object' && record.schedule !== null ? (record.schedule as RelationRecord) : {}
  const provider = getRelationDoc(record.provider)
  const service = getRelationDoc(record.service)
  const client = getRelationDoc(record.client)

  const start = typeof record.start === 'string' ? record.start : (schedule.start as string | undefined)
  const end = typeof record.end === 'string' ? record.end : (schedule.end as string | undefined)
  const timeZone =
    typeof record.timeZone === 'string' ? record.timeZone : (schedule.timeZone as string | undefined) ?? 'UTC'

  return {
    id: typeof record.id === 'string' ? record.id : String(record.id ?? ''),
    reference:
      typeof record.reference === 'string'
        ? record.reference
        : (record.reference as string | null | undefined) ?? null,
    status: typeof record.status === 'string' ? record.status : 'pending',
    start: start ?? '',
    end: end ?? '',
    timeZone,
    providerName:
      typeof record.providerName === 'string'
        ? record.providerName
        : (provider?.displayName as string | undefined) ?? 'نامشخص',
    serviceTitle:
      typeof record.serviceTitle === 'string'
        ? record.serviceTitle
        : (service?.title as string | undefined) ?? 'خدمت بدون عنوان',
    clientEmail:
      typeof record.clientEmail === 'string'
        ? record.clientEmail
        : (client?.email as string | undefined) ?? 'نامشخص',
    createdAt:
      typeof record.createdAt === 'string'
        ? record.createdAt
        : toISODateString(record.createdAt),
  }
}

const scheduleUpdateSchema = z
  .object({
    start: z.string({ required_error: 'Schedule start is required' }).datetime({ offset: true }),
    end: z.string({ required_error: 'Schedule end is required' }).datetime({ offset: true }),
    timeZone: z.string().min(1).optional(),
  })
  .refine(
    (value) => {
      const start = new Date(value.start)
      const end = new Date(value.end)
      return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end.getTime() > start.getTime()
    },
    { message: 'Schedule end must be after start', path: ['end'] },
  )

const updateSchema = z
  .object({
    status: z.enum(STATUS_VALUES).optional(),
    schedule: scheduleUpdateSchema.optional(),
  })
  .refine((value) => typeof value.status !== 'undefined' || typeof value.schedule !== 'undefined', {
    message: 'No updatable fields provided',
  })

export const dynamic = 'force-dynamic'

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

  const data: Record<string, unknown> = {}

  if (typeof body.status === 'string') {
    data.status = body.status
  }

  if (body.schedule) {
    data.schedule = {
      start: body.schedule.start,
      end: body.schedule.end,
      ...(body.schedule.timeZone ? { timeZone: body.schedule.timeZone } : {}),
    }
  }

  try {
    const updated = await payload.update({
      collection: 'appointments',
      id,
      data,
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json({
      appointment: mapAppointment(updated),
    })
  } catch (error) {
    payload.logger.error?.('Failed to update appointment from staff API', error)
    return NextResponse.json(
      {
        message: 'Unable to update appointment',
      },
      { status: 500 },
    )
  }
}
