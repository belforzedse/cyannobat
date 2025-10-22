import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import type { Payload } from 'payload'
import type { Where } from 'payload'

import configPromise from '@payload-config'
import { userIsStaff } from '@/lib/auth'
import type { StaffAppointment, StaffProvider, StaffUser } from '@/features/staff/types'
import { mapProviderDocToStaffProvider } from '@/features/staff/utils/mapProvider'
import type { Appointment, Provider as ProviderDoc, Service, User } from '@/payload-types'

type RelationValue<T> =
  | T
  | number
  | string
  | {
      relationTo: string
      value: string | number | T
    }

const getRelationDoc = <T,>(relation: RelationValue<T> | null | undefined): T | null => {
  if (!relation) return null

  if (typeof relation === 'object') {
    if ('relationTo' in relation && 'value' in relation) {
      const value = relation.value
      return value && typeof value === 'object' ? (value as T) : null
    }

    return relation as T
  }

  return null
}

type PopulatedAppointment = Appointment & {
  provider?: Appointment['provider']
  service?: Appointment['service']
  client?: Appointment['client']
}

type StaffSessionUser = NonNullable<Awaited<ReturnType<Payload['auth']>>['user']>

type LoadStaffSessionOptions = {
  onUnauthorizedRedirect?: string
}

export type StaffSession = {
  payload: Payload
  user: StaffSessionUser
  roles: string[]
  currentUser: StaffUser
}

export const shouldFilterAppointmentsForRoles = (roles: string[]): boolean =>
  roles.includes('doctor') && !roles.includes('receptionist') && !roles.includes('admin')

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

export const loadStaffSession = async (
  options: LoadStaffSessionOptions = {},
): Promise<StaffSession> => {
  const { onUnauthorizedRedirect = '/staff/login' } = options

  const payload = await getPayload({
    config: configPromise,
  })

  const headerStore = await headers()

  let user: StaffSessionUser | null = null

  try {
    const authResult = await payload.auth({
      headers: headerStore,
    })
    user = authResult?.user ?? null
  } catch (error) {
    payload.logger.warn?.('Failed to authenticate staff session', error)
  }

  if (!user || !userIsStaff(user)) {
    redirect(onUnauthorizedRedirect)
  }

  const rawRoles = Array.isArray((user as { roles?: unknown }).roles)
    ? ((user as { roles?: string[] }).roles ?? [])
    : []

  const roles = rawRoles.filter((role): role is string => typeof role === 'string')

  const currentUser: StaffUser = {
    id: String(user.id ?? ''),
    email: user.email ?? 'staff',
    roles,
  }

  return { payload, user, roles, currentUser }
}

export type DashboardScope = 'doctor' | 'receptionist'

type LoadDashboardDataOptions = {
  scope?: DashboardScope
}

type LoadDashboardDataResult = {
  appointments: StaffAppointment[]
  providers: StaffProvider[]
}

const findProvidersForAccount = async (
  payload: Payload,
  userId: number | string,
): Promise<ProviderDoc[]> => {
  const providerResult = await payload.find({
    collection: 'providers',
    where: {
      account: {
        equals: userId,
      },
    },
    limit: 50,
    depth: 1,
    overrideAccess: true,
  })

  return providerResult.docs as ProviderDoc[]
}

export const loadStaffDashboardData = async (
  payload: Payload,
  user: StaffSessionUser,
  roles: string[],
  options: LoadDashboardDataOptions = {},
): Promise<LoadDashboardDataResult> => {
  const now = new Date().toISOString()
  const filterByProvider =
    options.scope === 'doctor'
      ? true
      : options.scope === 'receptionist'
        ? false
        : shouldFilterAppointmentsForRoles(roles)

  let providerDocs: ProviderDoc[] = []

  if (filterByProvider) {
    providerDocs = await findProvidersForAccount(payload, user.id)

    if (providerDocs.length === 0) {
      return {
        appointments: [],
        providers: [],
      }
    }
  } else {
    const providerResult = await payload.find({
      collection: 'providers',
      sort: 'displayName',
      limit: 50,
      depth: 1,
      overrideAccess: true,
    })
    providerDocs = providerResult.docs as ProviderDoc[]
  }

  const baseWhere: Where = {
    'schedule.start': {
      greater_than_equal: now,
    },
  }

  const appointmentWhere: Where = filterByProvider
    ? {
        and: [
          baseWhere,
          {
            provider: {
              in: providerDocs.map((provider) => provider.id),
            },
          },
        ],
      }
    : baseWhere

  const appointmentResult = await payload.find({
    collection: 'appointments',
    where: appointmentWhere,
    sort: 'schedule.start',
    limit: 50,
    depth: 2,
    overrideAccess: true,
  })

  return {
    appointments: appointmentResult.docs.map(mapAppointment),
    providers: providerDocs.map(mapProviderDocToStaffProvider),
  }
}

export const getProviderIdsForUser = async (
  payload: Payload,
  user: StaffSessionUser,
): Promise<Array<number | string>> => {
  const providerDocs = await findProvidersForAccount(payload, user.id)
  return providerDocs.map((provider) => provider.id)
}
