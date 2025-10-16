import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import type { PayloadRequest } from 'payload'

const normalizeSlug = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

type UserWithRoles = PayloadRequest['user'] & { roles?: unknown }

const isAdmin = (user: PayloadRequest['user']): boolean => {
  const potentialRoles = (user as UserWithRoles | null | undefined)?.roles
  if (!Array.isArray(potentialRoles)) return false
  return potentialRoles.some((role): role is string => typeof role === 'string' && role === 'admin')
}

const getProviderIdsForUser = async (req: PayloadRequest): Promise<string[]> => {
  if (!req.user) return []

  const result = await req.payload.find({
    collection: 'providers',
    where: {
      account: {
        equals: req.user.id,
      },
    },
    depth: 0,
    limit: 25,
  })

  const ids = result.docs
    .map((doc) => {
      if (doc && typeof doc === 'object') {
        const candidate = (doc as { id?: unknown }).id
        if (typeof candidate === 'string' || typeof candidate === 'number') {
          return String(candidate)
        }
      }

      return null
    })
    .filter((value): value is string => typeof value === 'string')

  return ids
}

const servicesSlugHook: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data) return data

  if (data.title) {
    const base = typeof data.slug === 'string' && data.slug.trim().length > 0 ? data.slug : data.title
    data.slug = normalizeSlug(base)
  }

  return data
}

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: 'Service',
    plural: 'Services',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'pricing.amount', 'durationMinutes'],
  },
  hooks: {
    beforeValidate: [servicesSlugHook],
  },
  access: {
    read: () => true,
    create: async ({ req }) => {
      if (!req.user) return false
      if (isAdmin(req.user)) return true

      const providerIds = await getProviderIdsForUser(req)
      return providerIds.length > 0
    },
    update: async ({ req }) => {
      if (!req.user) return false
      if (isAdmin(req.user)) return true

      const providerIds = await getProviderIdsForUser(req)
      if (providerIds.length === 0) return false

      return {
        providers: {
          in: providerIds,
        },
      }
    },
    delete: async ({ req }) => {
      if (!req.user) return false
      if (isAdmin(req.user)) return true

      const providerIds = await getProviderIdsForUser(req)
      if (providerIds.length === 0) return false

      return {
        providers: {
          in: providerIds,
        },
      }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'text',
      label: 'Category',
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'providers',
      type: 'relationship',
      relationTo: 'providers',
      hasMany: true,
      required: true,
      admin: {
        description: 'Providers who can deliver this service.',
      },
    },
    {
      name: 'durationMinutes',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'bufferMinutesBefore',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'bufferMinutesAfter',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'pricing',
      label: 'Pricing',
      type: 'group',
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'currency',
          type: 'select',
          required: true,
          options: [
            { label: 'US Dollar (USD)', value: 'USD' },
            { label: 'Euro (EUR)', value: 'EUR' },
            { label: 'British Pound (GBP)', value: 'GBP' },
            { label: 'Canadian Dollar (CAD)', value: 'CAD' },
            { label: 'Australian Dollar (AUD)', value: 'AUD' },
          ],
          defaultValue: 'USD',
        },
        {
          name: 'taxRate',
          type: 'number',
          min: 0,
          admin: {
            description: 'Tax rate percentage applied to this service.',
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'leadTimeHours',
      type: 'number',
      min: 0,
      admin: {
        description: 'Minimum notice required before a booking can be made.',
      },
    },
    {
      name: 'instructions',
      type: 'textarea',
      label: 'Pre-appointment instructions',
    },
    {
      name: 'media',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      label: 'Supporting media',
    },
  ],
}
