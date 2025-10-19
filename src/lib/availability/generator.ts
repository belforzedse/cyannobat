import { DateTime } from 'luxon'
import type { Payload } from 'payload'

import type { Appointment, Provider, Service } from '@/payload-types'
import { bookingHold } from '../redis'

type AvailabilitySlotKind = 'in_person' | 'virtual'

export type AvailabilitySlot = {
  id: string
  start: string
  end: string
  kind: AvailabilitySlotKind
  timeZone: string
  providerId: string
  providerName: string
  serviceId: string
  serviceName: string
  leadTimeHours?: number | null
}

export type AvailabilityDay = {
  date: string
  note?: string
  slots: AvailabilitySlot[]
}

export type GenerateAvailabilityOptions = {
  rangeDays?: number
  serviceId?: string
  providerId?: string
}

export type GenerateAvailabilityResult = {
  rangeStart: string
  rangeEnd: string
  days: AvailabilityDay[]
}

const DEFAULT_DURATION_MINUTES = 30
const MAX_RANGE_DAYS = 60

const toMinutes = (time: string): number | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!match) return null
  const hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2], 10)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

const resolveRelationshipId = (value: unknown): string | null => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'object') {
    const candidate = (value as { id?: unknown }).id
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      return String(candidate)
    }
    const alt = (value as { value?: unknown }).value
    if (typeof alt === 'string' || typeof alt === 'number') {
      return String(alt)
    }
  }
  return null
}

const collectProviderServices = (
  provider: Provider,
  serviceMap: Map<string, Service>,
): Service[] => {
  const relations = Array.isArray(provider.services)
    ? provider.services
    : provider.services
      ? [provider.services]
      : []

  const results: Service[] = []
  for (const relation of relations) {
    const id = resolveRelationshipId(relation)
    if (!id) continue
    const service = serviceMap.get(id)
    if (service) {
      results.push(service)
    }
  }
  return results
}

const buildAvailabilitySlotId = ({
  providerId,
  serviceId,
  start,
}: {
  providerId: string
  serviceId: string
  start: string
}) => `${providerId}:${serviceId}:${start}`

const getWeekdaySlug = (date: DateTime, timeZone: string) =>
  date.setZone(timeZone, { keepLocalTime: true }).toFormat('cccc').toLowerCase()

const serviceAllowsBookingAt = (
  service: Service,
  slotStart: DateTime,
  now: DateTime,
): boolean => {
  if (service.isActive === false) return false
  const leadTimeHours =
    typeof service.leadTimeHours === 'number' ? service.leadTimeHours : null

  if (!leadTimeHours || leadTimeHours <= 0) return true

  const minStart = now.plus({ hours: leadTimeHours })
  return slotStart >= minStart
}

const appointmentKey = (providerId: string, serviceId: string) =>
  `${providerId}:${serviceId}`

const buildBusyMap = (
  appointments: Appointment[],
): Map<string, Array<{ start: DateTime; end: DateTime }>> => {
  const busy = new Map<string, Array<{ start: DateTime; end: DateTime }>>()
  for (const appointment of appointments) {
    if (!appointment?.schedule?.start || !appointment.provider || !appointment.service) {
      continue
    }

    if (appointment.status === 'cancelled') continue

    const providerId = resolveRelationshipId(appointment.provider)
    const serviceId = resolveRelationshipId(appointment.service)
    if (!providerId || !serviceId) continue

    const start = DateTime.fromISO(appointment.schedule.start, {
      zone: 'utc',
    })
    const end = appointment.schedule.end
      ? DateTime.fromISO(appointment.schedule.end, { zone: 'utc' })
      : start.plus({ minutes: appointment.schedule.durationMinutes ?? DEFAULT_DURATION_MINUTES })

    if (!start.isValid || !end.isValid) continue

    const key = appointmentKey(providerId, serviceId)
    const list = busy.get(key) ?? []
    list.push({ start, end })
    busy.set(key, list)
  }

  // Sort intervals to speed up overlap checks
  for (const [, intervals] of busy.entries()) {
    intervals.sort((a, b) => a.start.valueOf() - b.start.valueOf())
  }

  return busy
}

const overlapsExisting = (
  map: Map<string, Array<{ start: DateTime; end: DateTime }>>,
  providerId: string,
  serviceId: string,
  slotStart: DateTime,
  slotEnd: DateTime,
) => {
  const list = map.get(appointmentKey(providerId, serviceId))
  if (!list || list.length === 0) return false
  return list.some(
    ({ start, end }) =>
      slotStart < end && slotEnd > start,
  )
}

export const generateAvailability = async (
  payload: Payload,
  options: GenerateAvailabilityOptions = {},
): Promise<GenerateAvailabilityResult> => {
  const rangeDays =
    options.rangeDays && options.rangeDays > 0
      ? Math.min(options.rangeDays, MAX_RANGE_DAYS)
      : 14

  const now = DateTime.utc()
  const rangeStart = now.startOf('day')
  const rangeEnd = rangeStart.plus({ days: rangeDays })

  const serviceWhere = options.serviceId
    ? {
        id: {
          equals: options.serviceId,
        },
      }
    : undefined

  const { docs: services } = await payload.find({
    collection: 'services',
    where: serviceWhere,
    limit: 200,
    pagination: false,
    depth: 0,
  })

  const serviceMap = new Map<string, Service>()
  for (const service of services) {
    if (service && typeof service.id === 'string') {
      serviceMap.set(service.id, service)
    }
  }

  if (serviceMap.size === 0) {
    return {
      rangeStart: rangeStart.toISO(),
      rangeEnd: rangeEnd.toISO(),
      days: [],
    }
  }

  const providerWhere = options.providerId
    ? {
        id: {
          equals: options.providerId,
        },
      }
    : undefined

  const { docs: providers } = await payload.find({
    collection: 'providers',
    where: providerWhere,
    limit: 200,
    pagination: false,
    depth: 0,
  })

  const providerDocs: Provider[] = []
  for (const provider of providers) {
    if (!provider || typeof provider.id !== 'string') continue
    const relevantServices = collectProviderServices(provider, serviceMap)
    if (relevantServices.length === 0) continue
    providerDocs.push(provider)
  }

  if (providerDocs.length === 0) {
    return {
      rangeStart: rangeStart.toISO(),
      rangeEnd: rangeEnd.toISO(),
      days: [],
    }
  }

  const appointments: Appointment[] = []
  try {
    const { docs } = await payload.find({
      collection: 'appointments',
      where: {
        and: [
          {
            'schedule.start': {
              greater_than_equal: rangeStart.toISO(),
            },
          },
          {
            'schedule.start': {
              less_than: rangeEnd.toISO(),
            },
          },
        ],
      },
      limit: 1000,
      pagination: false,
      depth: 0,
    })
    appointments.push(...docs)
  } catch (error) {
    payload.logger.warn?.('Failed to preload appointments for availability', error)
  }

  const busyMap = buildBusyMap(appointments)

  const daysMap = new Map<string, AvailabilityDay>()

  const addSlotToDay = (slot: AvailabilitySlot) => {
    const slotDate = DateTime.fromISO(slot.start, { zone: 'utc' }).toISODate()
    if (!slotDate) return
    const existing = daysMap.get(slotDate)
    if (existing) {
      existing.slots.push(slot)
    } else {
      daysMap.set(slotDate, {
        date: slotDate,
        slots: [slot],
      })
    }
  }

  for (const provider of providerDocs) {
    const providerId = String(provider.id)
    const providerName = provider.displayName ?? `Provider ${providerId}`
    const timeZone =
      provider.location?.timeZone && typeof provider.location.timeZone === 'string'
        ? provider.location.timeZone
        : 'UTC'

    const defaultDuration =
      provider.availability?.defaultDurationMinutes &&
      Number.isFinite(provider.availability.defaultDurationMinutes)
        ? Number(provider.availability.defaultDurationMinutes)
        : null

    const availabilityWindows = Array.isArray(provider.availability?.windows)
      ? provider.availability?.windows ?? []
      : []

    if (!availabilityWindows || availabilityWindows.length === 0) {
      continue
    }

    const providerServices = collectProviderServices(provider, serviceMap)

    if (providerServices.length === 0) continue

    for (let offset = 0; offset < rangeDays; offset += 1) {
      const day = rangeStart.plus({ days: offset }).set({ hour: 12 })
      const weekdaySlug = getWeekdaySlug(day, timeZone)
      const applicableWindows = availabilityWindows.filter(
        (window) =>
          typeof window?.day === 'string' &&
          window.day.toLowerCase() === weekdaySlug,
      )

      if (applicableWindows.length === 0) continue

      for (const window of applicableWindows) {
        const startMinutes = window?.startTime ? toMinutes(window.startTime) : null
        const endMinutes = window?.endTime ? toMinutes(window.endTime) : null

        if (
          startMinutes === null ||
          endMinutes === null ||
          endMinutes <= startMinutes
        ) {
          continue
        }

        for (const service of providerServices) {
          const duration =
            typeof service.durationMinutes === 'number' && service.durationMinutes > 0
              ? service.durationMinutes
              : defaultDuration && defaultDuration > 0
                ? defaultDuration
                : DEFAULT_DURATION_MINUTES

          if (duration <= 0) continue

          let cursor = startMinutes
          while (cursor + duration <= endMinutes) {
            const slotStart = day
              .setZone(timeZone, { keepLocalTime: true })
              .set({ hour: Math.floor(cursor / 60), minute: cursor % 60, second: 0, millisecond: 0 })
              .toUTC()

            const slotEnd = slotStart.plus({ minutes: duration })

            if (!serviceAllowsBookingAt(service, slotStart, now)) {
              cursor += duration
              continue
            }

            if (
              overlapsExisting(
                busyMap,
                providerId,
                String(service.id),
                slotStart,
                slotEnd,
              )
            ) {
              cursor += duration
              continue
            }

            const startISO = slotStart.toISO()
            const endISO = slotEnd.toISO()

            if (!startISO || !endISO) {
              cursor += duration
              continue
            }

            try {
              const hold = await bookingHold.get({
                serviceId: String(service.id),
                slot: startISO,
              })
              if (hold && hold.ttlSeconds > 0) {
                cursor += duration
                continue
              }
            } catch {
              // Ignore hold lookup errors; slot will still be offered
            }

            const slot: AvailabilitySlot = {
              id: buildAvailabilitySlotId({
                providerId,
                serviceId: String(service.id),
                start: startISO,
              }),
              start: startISO,
              end: endISO,
              kind: 'in_person',
              timeZone,
              providerId,
              providerName,
              serviceId: String(service.id),
              serviceName: service.title ?? `Service ${service.id}`,
              leadTimeHours:
                typeof service.leadTimeHours === 'number'
                  ? service.leadTimeHours
                  : undefined,
            }

            addSlotToDay(slot)
            cursor += duration
          }
        }
      }
    }
  }

  const days = Array.from(daysMap.values())
    .map((day) => ({
      ...day,
      slots: day.slots.sort((a, b) => a.start.localeCompare(b.start)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    rangeStart: rangeStart.toISO(),
    rangeEnd: rangeEnd.toISO(),
    days,
  }
}
