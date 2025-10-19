import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth'

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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      {
        message: 'Invalid JSON body',
      },
      { status: 400 },
    )
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      {
        message: 'Request body must be an object',
      },
      { status: 400 },
    )
  }

  const data: Record<string, unknown> = {}

  if ('status' in body && typeof (body as { status?: unknown }).status === 'string') {
    data.status = (body as { status?: string }).status
  }

  if ('schedule' in body && typeof (body as { schedule?: unknown }).schedule === 'object') {
    data.schedule = (body as { schedule?: unknown }).schedule
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      {
        message: 'No updatable fields provided',
      },
      { status: 400 },
    )
  }

  try {
    const updated = await payload.update({
      collection: 'appointments',
      id,
      data,
      overrideAccess: true,
    })

    return NextResponse.json({
      appointment: updated,
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
