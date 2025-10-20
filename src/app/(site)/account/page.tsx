import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { extractRoles, userIsStaff } from '@/lib/auth'
import type { Appointment, Provider as ProviderDoc, Service } from '@/payload-types'
import AccountPageClient from '@/features/account/components/AccountPageClient'

type PopulatedAppointment = Appointment & {
  provider?: Appointment['provider']
  service?: Appointment['service']
}

const getRelationDoc = <T,>(relation: unknown): T | null => {
  if (!relation || typeof relation === 'string') return null
  if (typeof relation === 'object') {
    const candidate = relation as { value?: unknown }
    if ('value' in candidate) {
      const value = candidate.value
      if (value && typeof value === 'object') {
        return value as T
      }
      return null
    }
    return relation as T
  }
  return null
}

const mapAppointment = (appointment: PopulatedAppointment) => {
  const schedule = appointment.schedule ?? {}
  const provider = getRelationDoc<ProviderDoc>(appointment.provider)
  const service = getRelationDoc<Service>(appointment.service)

  return {
    id: String(appointment.id ?? ''),
    start: schedule.start ?? '',
    end: schedule.end ?? '',
    timeZone: schedule.timeZone ?? 'UTC',
    providerName: provider?.displayName ?? 'نامشخص',
    serviceTitle: service?.title ?? 'خدمت بدون عنوان',
    status: appointment.status ?? 'pending',
  }
}

export const dynamic = 'force-dynamic'

const AccountPage = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const headerStore = await headers()

  const authResult = await payload
    .auth({
      headers: headerStore,
    })
    .catch(() => ({ user: null }))

  const authUser = authResult?.user

  if (!authUser) {
    redirect('/login')
  }

  const userId = String((authUser as { id?: string | number }).id ?? '')
  const userName = (authUser as { name?: string }).name ?? ''
  const userEmail = (authUser as { email?: string }).email ?? ''
  const userPhone = (authUser as { phone?: string }).phone ?? ''
  const roles = extractRoles(authUser)
  const isStaff = userIsStaff(authUser)

  let upcomingAppointments: ReturnType<typeof mapAppointment>[] = []

  if (!isStaff && userId) {
    const result = await payload.find({
      collection: 'appointments',
      where: {
        client: {
          equals: userId,
        },
      },
      sort: 'schedule.start',
      limit: 5,
      depth: 2,
      overrideAccess: true,
    })

    upcomingAppointments = result.docs.map((doc) => mapAppointment(doc as PopulatedAppointment))
  }

  return (
    <AccountPageClient
      userName={userName}
      userEmail={userEmail}
      userPhone={userPhone}
      roles={roles}
      isStaff={isStaff}
      upcomingAppointments={upcomingAppointments}
    />
  )
}

export default AccountPage
