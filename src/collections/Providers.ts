import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload';
import { userIsAdmin, userIsStaff } from '@/lib/auth';

const normalizeSlug = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const providerSlugHook: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data) return data;

  if (data.displayName) {
    const base =
      typeof data.slug === 'string' && data.slug.trim().length > 0 ? data.slug : data.displayName;
    data.slug = normalizeSlug(base);
  }

  return data;
};

export const Providers: CollectionConfig = {
  slug: 'providers',
  labels: {
    singular: 'Provider',
    plural: 'Providers',
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'account', 'location.timeZone', 'createdAt'],
  },
  hooks: {
    beforeValidate: [providerSlugHook],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user) && userIsStaff(req.user),
    update: async ({ req }) => {
      if (!req.user) return false;
      if (userIsStaff(req.user)) return true;

      return {
        account: {
          equals: req.user.id,
        },
      };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      return userIsAdmin(req.user);
    },
  },
  fields: [
    {
      name: 'account',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'The user account that manages this provider profile.',
      },
    },
    {
      name: 'displayName',
      type: 'text',
      label: 'Display name',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from the display name. Override as needed.',
      },
    },
    {
      name: 'headline',
      type: 'text',
      label: 'Headline',
    },
    {
      name: 'bio',
      type: 'richText',
      label: 'Biography',
    },
    {
      name: 'specialties',
      type: 'array',
      label: 'Specialties',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Specialty label',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Contact information',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Contact email',
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone number',
        },
        {
          name: 'website',
          type: 'text',
          label: 'Website',
        },
      ],
    },
    {
      name: 'location',
      type: 'group',
      label: 'Location & scheduling defaults',
      fields: [
        {
          name: 'address',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'region',
          type: 'text',
          label: 'State / Province / Region',
        },
        {
          name: 'postalCode',
          type: 'text',
        },
        {
          name: 'country',
          type: 'text',
        },
        {
          name: 'timeZone',
          type: 'text',
          required: true,
          defaultValue: 'UTC',
        },
      ],
    },
    {
      name: 'availability',
      type: 'group',
      label: 'Availability',
      fields: [
        {
          name: 'defaultDurationMinutes',
          type: 'number',
          min: 0,
          admin: {
            description:
              'Default appointment duration in minutes when no service duration is specified.',
          },
        },
        {
          name: 'windows',
          type: 'array',
          label: 'Availability windows',
          fields: [
            {
              name: 'day',
              type: 'select',
              required: true,
              options: [
                { label: 'Monday', value: 'monday' },
                { label: 'Tuesday', value: 'tuesday' },
                { label: 'Wednesday', value: 'wednesday' },
                { label: 'Thursday', value: 'thursday' },
                { label: 'Friday', value: 'friday' },
                { label: 'Saturday', value: 'saturday' },
                { label: 'Sunday', value: 'sunday' },
              ],
            },
            {
              name: 'startTime',
              type: 'text',
              label: 'Start time (HH:MM)',
              required: true,
            },
            {
              name: 'endTime',
              type: 'text',
              label: 'End time (HH:MM)',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: {
        description: 'Services that this provider offers.',
      },
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile image',
    },
    {
      name: 'meta',
      type: 'group',
      label: 'Metadata',
      fields: [
        {
          name: 'rating',
          type: 'number',
          min: 0,
          max: 5,
        },
        {
          name: 'reviewCount',
          type: 'number',
          min: 0,
        },
        {
          name: 'languages',
          type: 'array',
          fields: [
            {
              name: 'language',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
