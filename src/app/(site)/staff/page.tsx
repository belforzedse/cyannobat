import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { userIsStaff } from '@/lib/auth'
import StaffDashboard from '@/features/staff/components/StaffDashboard'
import type { StaffAppointment, StaffProvider, StaffUser } from '@/features/staff/types'
import type { Appointment, Provider as ProviderDoc, Service, User } from '@/payload-types'

export const dynamic = 'force-dynamic'

const getRelationDoc = <T,>(relation: { relationTo: string; value: string | T } | null | undefined): T | null => {
  if (!relation) return null
  const { value } = relation
  if (value && typeof value === 'object') {
    return value as T
  }
  return null
}

type PopulatedAppointment = Appointment & {
  provider?: Appointment['provider']
  service?: Appointment['service']
  client?: Appointment['client']
}

const mapAppointment = (doc: PopulatedAppointment): StaffAppointment => {
  const schedule = doc?.schedule ?? {}
  const provider = getRelationDoc<ProviderDoc>(doc.provider)
  const service = getRelationDoc<Service>(doc.service)
  const client = getRelationDoc<User>(doc.client)

  return {
    id: String(doc.id ?? ''),
    reference: doc.reference ?? null,
    status: doc.status ?? 'pending',
    start: schedule.start ?? '',
    end: schedule.end ?? '',
    timeZone: schedule.timeZone ?? 'UTC',
    providerName: provider?.displayName ?? 'نامشخص',
    serviceTitle: service?.title ?? 'خدمت بدون عنوان',
    clientEmail: client?.email ?? 'نامشخص',
    createdAt: doc.createdAt ?? new Date().toISOString(),
  }
}

type AvailabilityWindow = NonNullable<NonNullable<ProviderDoc['availability']>['windows']>[number]

const mapProvider = (doc: ProviderDoc): StaffProvider => {
  const availability: AvailabilityWindow[] = Array.isArray(doc?.availability?.windows)
    ? (doc.availability.windows as AvailabilityWindow[])
    : []

  return {
    id: String(doc.id ?? ''),
    displayName: doc.displayName ?? 'پزشک',
    timeZone: doc?.location?.timeZone ?? 'UTC',
    availability: availability.map((window) => ({
      day: window?.day ?? 'نامشخص',
      startTime: window?.startTime ?? '--:--',
      endTime: window?.endTime ?? '--:--',
    })),
  }
}

const StaffPage = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const headerStore = await headers()

  const authResult = await payload
    .auth({
      headers: headerStore,
    })
    .catch(() => ({ user: null }))

  const user = authResult?.user

  if (!user || !userIsStaff(user)) {
    redirect('/staff/login')
  }

  const now = new Date().toISOString()

  const [appointmentResult, providerResult] = await Promise.all([
    payload.find({
      collection: 'appointments',
      where: {
        'schedule.start': {
          greater_than_equal: now,
        },
      },
      sort: 'schedule.start',
      limit: 50,
      depth: 2,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'providers',
      sort: 'displayName',
      limit: 50,
      depth: 1,
      overrideAccess: true,
    }),
  ])

  const userRoles = Array.isArray((user as { roles?: unknown }).roles)
    ? ((user as { roles?: string[] }).roles ?? [])
    : []

  const currentUser: StaffUser = {
    email: user.email ?? 'staff',
    roles: userRoles,
  }

  const appointments = appointmentResult.docs.map(mapAppointment)
  const providers = providerResult.docs.map(mapProvider)

  return (
    <section className="px-4 py-8 sm:px-10 sm:py-12">
      <StaffDashboard initialAppointments={appointments} initialProviders={providers} currentUser={currentUser} />
    </section>
  )
}

export default StaffPage
