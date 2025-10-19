import { NextResponse } from 'next/server'
import type { Where } from 'payload'

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth'

export const dynamic = 'force-dynamic'

export const GET = async (request: Request) => {
  const { payload, user } = await authenticateStaffRequest(request)

  if (!user) {
    return unauthorizedResponse()
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const limit = Number.parseInt(url.searchParams.get('limit') ?? '50', 10)

  const now = new Date()

  const baseWhere: Where = {
    'schedule.start': {
      greater_than_equal: now.toISOString(),
    },
  }

  const where: Where = status
    ? {
        and: [
          baseWhere,
          {
            status: {
              equals: status,
            },
          },
        ],
      }
    : baseWhere

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
