import type { PayloadRequest } from 'payload'

type UserLike = PayloadRequest['user'] & {
  roles?: unknown
}

const extractRoles = (user: PayloadRequest['user'] | null | undefined): string[] => {
  if (!user) return []
  const potentialRoles = (user as UserLike).roles
  if (!Array.isArray(potentialRoles)) return []
  return potentialRoles.filter((role): role is string => typeof role === 'string')
}

export const userHasRole = (user: PayloadRequest['user'] | null | undefined, role: string): boolean =>
  extractRoles(user).includes(role)

export const userIsAdmin = (user: PayloadRequest['user'] | null | undefined): boolean => userHasRole(user, 'admin')

export const userIsStaff = (user: PayloadRequest['user'] | null | undefined): boolean =>
  userIsAdmin(user) || userHasRole(user, 'doctor') || userHasRole(user, 'receptionist')

