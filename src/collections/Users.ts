import type { Access, CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { ValidationError } from 'payload'

import { extractRoles } from '@/lib/auth'
import { canAssignRoles } from '@/lib/staff/rolePermissions'

// Allow creating first user without authentication
const isFirstUserCreation: Access = async ({ req }) => {
  // If user is already authenticated, allow access
  if (req.user) {
    return true
  }

  // If not authenticated, check if this could be the first user
  try {
    const result = await req.payload.count({
      collection: 'users',
    })

    // If no users exist, allow unauthenticated access to create first user
    return result.totalDocs === 0
  } catch {
    // If there's an error (e.g., table doesn't exist yet), allow creation
    // This handles the initial setup case
    return true
  }
}

const rolesFromData = (roles: unknown): string[] => {
  if (!Array.isArray(roles)) return []
  return roles.filter((role): role is string => typeof role === 'string')
}

const canCreateUser: Access = async (args) => {
  const { req, data } = args

  const requestedRoles = rolesFromData(data?.roles)
  const rolesToAssign = requestedRoles.length > 0 ? requestedRoles : ['patient']

  if (!req.user) {
    const onlyPatientRoles = rolesToAssign.every((role) => role === 'patient')
    if (onlyPatientRoles) {
      return true
    }

    return isFirstUserCreation(args)
  }

  const creatorRoles = extractRoles(req.user)

  return canAssignRoles(creatorRoles, rolesToAssign)
}

const enforcePatientRoleForUnauthenticated: CollectionBeforeValidateHook = ({ data, req }) => {
  if (req.user) return data

  const nextData = { ...(data ?? {}) }
  nextData.roles = ['patient']

  return nextData
}

const ensureContactMethod: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  const nextData = { ...(data ?? {}) }
  const phoneCandidate =
    typeof nextData.phone === 'string'
      ? nextData.phone.trim()
      : typeof originalDoc?.phone === 'string'
        ? originalDoc.phone.trim()
        : ''

  if (!phoneCandidate) {
    throw new ValidationError({
      collection: 'users',
      errors: [{ message: 'Phone number is required.', path: 'phone' }],
    })
  }

  if (typeof nextData.phone === 'string') {
    nextData.phone = phoneCandidate
  }

  nextData.username = phoneCandidate

  if (typeof nextData.email === 'string') {
    const trimmedEmail = nextData.email.trim()
    nextData.email = trimmedEmail || undefined
  }

  return nextData
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'phone',
    defaultColumns: ['email', 'name', 'phone', 'roles'],
  },
  hooks: {
    beforeValidate: [enforcePatientRoleForUnauthenticated, ensureContactMethod],
  },
  auth: {
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: false,
      requireUsername: true,
    },
  },
  access: {
    create: canCreateUser,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.trim().length === 0) return 'Phone number is required'

        const iranPhoneRegex = /^(\+98|0)?9\d{9}$/
        return iranPhoneRegex.test(value) || 'Enter a valid Iranian phone number'
      },
    },
    {
      name: 'username',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        condition: () => false,
      },
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['patient'],
      options: [
        { label: 'Patient', value: 'patient' },
        { label: 'Doctor', value: 'doctor' },
        { label: 'Receptionist', value: 'receptionist' },
        { label: 'Admin', value: 'admin' },
      ],
    },
  ],
}
