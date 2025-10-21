import type { PayloadRequest } from 'payload'

import { ASSIGNABLE_ROLES, type AssignableRole } from '@/lib/staff/rolePermissions'

type UserLike = PayloadRequest['user'] & {
  roles?: unknown
}

const isAssignableRole = (value: unknown): value is AssignableRole =>
  typeof value === 'string' && (ASSIGNABLE_ROLES as readonly string[]).includes(value)

export const extractRoles = (user: PayloadRequest['user'] | null | undefined): string[] => {
  if (!user) return []
  const potentialRoles = (user as UserLike).roles
  if (!Array.isArray(potentialRoles)) return []
  return potentialRoles.filter(isAssignableRole)
}

export const userHasRole = (user: PayloadRequest['user'] | null | undefined, role: string): boolean =>
  extractRoles(user).includes(role)

export const userIsAdmin = (user: PayloadRequest['user'] | null | undefined): boolean => userHasRole(user, 'admin')

export const userIsStaff = (user: PayloadRequest['user'] | null | undefined): boolean =>
  userIsAdmin(user) || userHasRole(user, 'doctor') || userHasRole(user, 'receptionist')
