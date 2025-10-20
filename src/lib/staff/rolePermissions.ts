export type AssignableRole = 'patient' | 'doctor' | 'receptionist' | 'admin'

export const ASSIGNABLE_ROLES: readonly AssignableRole[] = ['patient', 'doctor', 'receptionist', 'admin']

const adminAssignable: AssignableRole[] = ['admin', 'doctor', 'receptionist', 'patient']
const doctorAssignable: AssignableRole[] = ['receptionist', 'patient']
const receptionistAssignable: AssignableRole[] = ['patient']

const normalizeRoles = (roles: string[]): AssignableRole[] =>
  roles.filter((role): role is AssignableRole => ASSIGNABLE_ROLES.includes(role as AssignableRole))

export const getCreatableRolesForUser = (roles: string[]): AssignableRole[] => {
  const allowed = new Set<AssignableRole>()

  normalizeRoles(roles).forEach((role) => {
    if (role === 'admin') {
      adminAssignable.forEach((value) => allowed.add(value))
    }
    if (role === 'doctor') {
      doctorAssignable.forEach((value) => allowed.add(value))
    }
    if (role === 'receptionist') {
      receptionistAssignable.forEach((value) => allowed.add(value))
    }
  })

  return Array.from(allowed)
}

export const canAssignRoles = (creatorRoles: string[], targetRoles: string[]): boolean => {
  const allowed = new Set(getCreatableRolesForUser(creatorRoles))

  if (targetRoles.length === 0) {
    return allowed.has('patient')
  }

  const normalized = normalizeRoles(targetRoles)

  if (normalized.length !== targetRoles.length) {
    return false
  }

  return normalized.every((role) => allowed.has(role))
}
