import { NextResponse } from 'next/server'
import type { Where } from 'payload'
import { ZodError, z } from 'zod'

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth'
import type { StaffAppointment } from '@/features/staff/types'
import {
  getProviderIdsForUser,
  shouldFilterAppointmentsForRoles,
} from '@/features/staff/server/loadStaffData'
import type { DashboardScope } from '@/features/staff/server/loadStaffData'

export const dynamic = 'force-dynamic'

const STATUS_VALUES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as const

type RelationRecord = { [key: string]: unknown }

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

const mapAppointment = (doc: Record<string, unknown>): StaffAppointment => {
  const schedule = typeof doc.schedule === 'object' && doc.schedule !== null ? (doc.schedule as RelationRecord) : {}
  const provider = getRelationDoc(doc.provider)
  const service = getRelationDoc(doc.service)
  const client = getRelationDoc(doc.client)

  const start = typeof doc.start === 'string' ? doc.start : (schedule.start as string | undefined)
  const end = typeof doc.end === 'string' ? doc.end : (schedule.end as string | undefined)
  const timeZone =
    typeof doc.timeZone === 'string' ? doc.timeZone : (schedule.timeZone as string | undefined) ?? 'UTC'

  return {
    id: typeof doc.id === 'string' ? doc.id : String(doc.id ?? ''),
    reference: typeof doc.reference === 'string' ? doc.reference : (doc.reference as string | null | undefined) ?? null,
    status: typeof doc.status === 'string' ? doc.status : 'pending',
    start: start ?? '',
    end: end ?? '',
    timeZone,
    providerName: typeof doc.providerName === 'string' ? doc.providerName : (provider?.displayName as string | undefined) ?? 'نامشخص',
    serviceTitle: typeof doc.serviceTitle === 'string' ? doc.serviceTitle : (service?.title as string | undefined) ?? 'خدمت بدون عنوان',
    clientEmail: typeof doc.clientEmail === 'string' ? doc.clientEmail : (client?.email as string | undefined) ?? 'نامشخص',
    createdAt:
      typeof doc.createdAt === 'string'
        ? doc.createdAt
        : toISODateString(doc.createdAt),
  }
}

const createAppointmentSchema = z
  .object({
    client: z.string({ required_error: 'Client is required' }).min(1, 'Client is required'),
    service: z.string({ required_error: 'Service is required' }).min(1, 'Service is required'),
    provider: z.string({ required_error: 'Provider is required' }).min(1, 'Provider is required'),
    status: z.enum(STATUS_VALUES).optional(),
    schedule: z
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
      ),
  })
  .strict()

export const GET = async (request: Request) => {
  const { payload, user } = await authenticateStaffRequest(request)

  if (!user) {
    return unauthorizedResponse()
  }

  const rawRoles = Array.isArray((user as { roles?: unknown }).roles)
    ? ((user as { roles?: string[] }).roles ?? [])
    : []

  const roles = rawRoles.filter((role): role is string => typeof role === 'string')

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const scopeParam = url.searchParams.get('scope')
  const scope: DashboardScope | null =
    scopeParam === 'doctor' || scopeParam === 'receptionist' ? (scopeParam as DashboardScope) : null
  const limit = Number.parseInt(url.searchParams.get('limit') ?? '50', 10)

  const now = new Date()

  const baseWhere: Where = {
    'schedule.start': {
      greater_than_equal: now.toISOString(),
    },
  }

  const filters: Where[] = [baseWhere]

  const enforceProviderFilter = scope === 'doctor' || shouldFilterAppointmentsForRoles(roles)

  if (enforceProviderFilter) {
    const providerIds = await getProviderIdsForUser(payload, user)

    if (providerIds.length === 0) {
      return NextResponse.json({ appointments: [], total: 0 })
    }

    filters.push({
      provider: {
        in: providerIds,
      },
    })
  }

  const whereFilters = status
    ? [
        ...filters,
        {
          status: {
            equals: status,
          },
        },
      ]
    : filters

  const where: Where = whereFilters.length === 1 ? whereFilters[0] : { and: whereFilters }

  const appointments = await payload.find({
    collection: 'appointments',
    where,
    sort: 'schedule.start',
    limit: Number.isNaN(limit) ? 50 : Math.min(Math.max(limit, 1), 200),
    depth: 2,
    overrideAccess: true,
  })

  return NextResponse.json({
    appointments: appointments.docs,
    total: appointments.totalDocs,
  })
}

export const POST = async (request: Request) => {
  const { payload, user } = await authenticateStaffRequest(request)

  if (!user) {
    return unauthorizedResponse()
  }

  let body: z.infer<typeof createAppointmentSchema>

  try {
    const json = await request.json()
    body = createAppointmentSchema.parse(json)
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

  try {
    const created = await payload.create({
      collection: 'appointments',
      data: {
        client: {
          relationTo: 'users',
          value: body.client,
        },
        service: {
          relationTo: 'services',
          value: body.service,
        },
        provider: {
          relationTo: 'providers',
          value: body.provider,
        },
        status: body.status ?? 'pending',
        schedule: {
          start: body.schedule.start,
          end: body.schedule.end,
          timeZone: body.schedule.timeZone ?? 'UTC',
        },
      },
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json(
      {
        appointment: mapAppointment(created as Record<string, unknown>),
      },
      { status: 201 },
    )
  } catch (error) {
    payload.logger.error?.('Failed to create appointment from staff API', error)
    return NextResponse.json(
      {
        message: 'Unable to create appointment',
      },
      { status: 500 },
    )
  }
}
