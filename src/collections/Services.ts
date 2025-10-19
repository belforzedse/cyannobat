import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { userIsStaff } from '@/lib/auth'

const normalizeSlug = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

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
      return userIsStaff(req.user)
    },
    update: async ({ req }) => {
      if (!req.user) return false
      return userIsStaff(req.user)
    },
    delete: async ({ req }) => {
      if (!req.user) return false
      return userIsStaff(req.user)
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
