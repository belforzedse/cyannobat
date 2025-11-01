import type { Provider as ProviderDoc } from '@/payload-types'
import type {
  StaffProvider,
  StaffProviderAvailabilityWindow,
} from '@/lib/staff/types'

const getAccountId = (account: ProviderDoc['account']): string => {
  if (typeof account === 'string' || typeof account === 'number') {
    return String(account)
  }

  if (account && typeof account === 'object' && 'id' in account) {
    const value = account.id
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value)
    }
  }

  return ''
}

type AvailabilityWindow = NonNullable<NonNullable<ProviderDoc['availability']>['windows']>[number]

const mapAvailabilityWindows = (windows: unknown): StaffProviderAvailabilityWindow[] => {
  if (!Array.isArray(windows)) {
    return []
  }

  return (windows as AvailabilityWindow[]).map((window) => ({
    day: typeof window?.day === 'string' ? window.day : 'نامشخص',
    startTime: typeof window?.startTime === 'string' ? window.startTime : '--:--',
    endTime: typeof window?.endTime === 'string' ? window.endTime : '--:--',
  }))
}

export const mapProviderDocToStaffProvider = (doc: ProviderDoc): StaffProvider => {
  const availability = doc?.availability?.windows ?? []

  return {
    id: String(doc.id ?? ''),
    displayName: doc.displayName ?? 'ارائه‌دهنده',
    timeZone: doc?.location?.timeZone ?? 'UTC',
    availability: mapAvailabilityWindows(availability),
    accountId: getAccountId(doc.account),
  }
}
