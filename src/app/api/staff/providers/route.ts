import { NextResponse } from 'next/server'

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth'
import { mapProviderDocToStaffProvider } from '@/features/staff/utils/mapProvider'
import type { Provider as ProviderDoc } from '@/payload-types'

export const dynamic = 'force-dynamic'

export const GET = async (request: Request) => {
  const { payload, user } = await authenticateStaffRequest(request)

  if (!user) {
    return unauthorizedResponse()
  }

  const providers = await payload.find({
    collection: 'providers',
    sort: 'displayName',
    depth: 1,
    limit: 100,
    overrideAccess: true,
  })

  return NextResponse.json({
    providers: (providers.docs as ProviderDoc[]).map(mapProviderDocToStaffProvider),
  })
}

