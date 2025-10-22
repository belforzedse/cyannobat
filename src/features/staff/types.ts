export type StaffAppointment = {
  id: string
  reference?: string | null
  status: string
  start: string
  end: string
  timeZone: string
  providerName: string
  serviceTitle: string
  clientEmail: string
  createdAt: string
}

export type StaffProviderAvailabilityWindow = {
  day: string
  startTime: string
  endTime: string
}

export type StaffProvider = {
  id: string
  displayName: string
  availability: StaffProviderAvailabilityWindow[]
  timeZone: string
  accountId: string
}

export type StaffUser = {
  id: string
  email: string
  roles: string[]
}

