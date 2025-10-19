import { NextResponse } from 'next/server'

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

  const where: Record<string, unknown> = {
    'schedule.start': {
      greater_than_equal: now.toISOString(),
    },
  }

  if (status) {
    where.status = {
      equals: status,
    }
  }

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
