import { NextResponse } from 'next/server'
import { DateTime } from 'luxon'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import {
  generateAvailability,
  type GenerateAvailabilityOptions,
} from '@/lib/availability/generator'

export const dynamic = 'force-dynamic'

const parseRangeDays = (value: string | null): number | undefined => {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed <= 0) return undefined
  return parsed
}

export const GET = async (request: Request) => {
  const payload = await getPayload({
    config: configPromise,
  })

  const url = new URL(request.url)

  const options: GenerateAvailabilityOptions = {
    rangeDays: parseRangeDays(url.searchParams.get('rangeDays')),
  }

  const serviceId = url.searchParams.get('serviceId')
  if (serviceId) {
    options.serviceId = serviceId
  }

  const providerId = url.searchParams.get('providerId')
  if (providerId) {
    options.providerId = providerId
  }

  try {
    const result = await generateAvailability(payload, options)

    return NextResponse.json({
      generatedAt: DateTime.utc().toISO(),
      range: {
        start: result.rangeStart,
        end: result.rangeEnd,
      },
      filters: {
        serviceId: options.serviceId ?? null,
        providerId: options.providerId ?? null,
        rangeDays: options.rangeDays ?? 14,
      },
      days: result.days,
    })
  } catch (error) {
    payload.logger.error?.('Failed to build availability calendar', error)
    return NextResponse.json(
      {
        message: 'Failed to build availability calendar',
      },
      { status: 500 },
    )
  }
}

