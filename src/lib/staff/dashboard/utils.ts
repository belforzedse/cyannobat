import type { StaffAppointment } from '@/lib/staff/types'

export type UnknownRecord = Record<string, unknown>

export const getRelationDoc = (relation: unknown): UnknownRecord | null => {
  if (!relation || typeof relation !== 'object') {
    return null
  }

  const record = relation as UnknownRecord

  if ('relationTo' in record && 'value' in record) {
    const value = record.value
    return value && typeof value === 'object' ? (value as UnknownRecord) : null
  }

  return record
}

export const toStaffAppointment = (doc: UnknownRecord): StaffAppointment => {
  const schedule = typeof doc.schedule === 'object' && doc.schedule !== null ? (doc.schedule as UnknownRecord) : {}
  const provider = getRelationDoc(doc.provider)
  const service = getRelationDoc(doc.service)
  const client = getRelationDoc(doc.client)

  const start = typeof doc.start === 'string' ? doc.start : (schedule.start as string | undefined)
  const end = typeof doc.end === 'string' ? doc.end : (schedule.end as string | undefined)
  const timeZone =
    typeof doc.timeZone === 'string' ? doc.timeZone : (schedule.timeZone as string | undefined) ?? 'UTC'

  let createdAt: string
  if (typeof doc.createdAt === 'string') {
    createdAt = doc.createdAt
  } else if (doc.createdAt instanceof Date && !Number.isNaN(doc.createdAt.getTime())) {
    createdAt = doc.createdAt.toISOString()
  } else {
    createdAt = new Date().toISOString()
  }

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
    createdAt,
  }
}

export const mapAppointmentFromApi = (doc: unknown): StaffAppointment => {
  if (!doc || typeof doc !== 'object') {
    return toStaffAppointment({})
  }

  const record = doc as UnknownRecord

  if (
    typeof record.start === 'string' &&
    typeof record.end === 'string' &&
    typeof record.timeZone === 'string' &&
    typeof record.clientEmail === 'string'
  ) {
    return toStaffAppointment(record)
  }

  return toStaffAppointment(record)
}

const getTimeValue = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime()
}

export const sortAppointmentsByStart = (items: StaffAppointment[]) =>
  [...items].sort((a, b) => getTimeValue(a.start) - getTimeValue(b.start))

export const toInputValue = (iso: string) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 16)
}

export const toISOStringOrNull = (value: string): string | null => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

export const formatDateTime = (iso: string, timeZone: string) => {
  try {
    const date = new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso))
    const time = new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timeZone || 'UTC',
    }).format(new Date(iso))
    return `${date} — ${time}`
  } catch {
    return iso
  }
}

