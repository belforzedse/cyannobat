import type { Access, CollectionConfig } from 'payload'

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

  if (!req.user) {
    return isFirstUserCreation(args)
  }

  const creatorRoles = extractRoles(req.user)
  const requestedRoles = rolesFromData(data?.roles)
  const rolesToAssign = requestedRoles.length > 0 ? requestedRoles : ['patient']

  return canAssignRoles(creatorRoles, rolesToAssign)
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'phone', 'roles'],
  },
  auth: true,
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
      validate: (value) => {
        if (typeof value !== 'string') return 'Phone number is required'

        const iranPhoneRegex = /^(\+98|0)?9\d{9}$/
        return iranPhoneRegex.test(value) || 'Enter a valid Iranian phone number'
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
