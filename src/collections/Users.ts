import type { Access, CollectionConfig } from 'payload'

// Allow creating first user without authentication
const isFirstUserCreation: Access = async ({ req }) => {
  // Try to count existing users
  try {
    const users = await req.payload.countGlobal({
      collection: 'users',
    }).catch(() => 0)

    // If no users exist, allow unauthenticated access
    if (users === 0 || !users) {
      return true
    }
  } catch {
    // If there's an error querying, assume it's the first user
    return true
  }

  // Otherwise, require authentication
  return !!req.user
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    create: isFirstUserCreation,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
