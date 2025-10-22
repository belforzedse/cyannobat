import { NextResponse } from 'next/server'
import type { Where } from 'payload'

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth'
import {
  getProviderIdsForUser,
  shouldFilterAppointmentsForRoles,
} from '@/features/staff/server/loadStaffData'
import type { DashboardScope } from '@/features/staff/server/loadStaffData'

export const dynamic = 'force-dynamic'

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
