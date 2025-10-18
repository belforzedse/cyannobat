import type { Access, CollectionConfig } from 'payload'

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
