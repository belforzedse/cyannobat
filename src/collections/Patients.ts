import type { CollectionConfig, Where } from 'payload';

import { userIsStaff } from '@/lib/auth';

export const Patients: CollectionConfig = {
  slug: 'patients',
  labels: {
    singular: 'Patient Folder',
    plural: 'Patient Folders',
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'owner', 'primaryProvider', 'updatedAt'],
    description:
      'Centralized clinical record containing visit documentation, prescriptions, and shared resources for each patient.',
  },
  access: {
    read: async ({ req }) => {
      if (!req.user) return false;
      if (userIsStaff(req.user)) return true;
      return {
        owner: {
          equals: req.user.id,
        },
      } as Where;
    },
    create: ({ req }) => Boolean(req.user && userIsStaff(req.user)),
    update: ({ req }) => Boolean(req.user && userIsStaff(req.user)),
    delete: ({ req }) => Boolean(req.user && userIsStaff(req.user)),
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The account that owns this patient record.',
      },
    },
    {
      name: 'displayName',
      label: 'Patient display name',
      type: 'text',
      required: true,
    },
    {
      name: 'primaryProvider',
      type: 'relationship',
      relationTo: 'providers',
      admin: {
        position: 'sidebar',
        description: 'The lead provider responsible for this patient record.',
      },
    },
    {
      name: 'patientFolders',
      label: 'Patient folders',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'documents',
          label: 'Uploaded documents',
          type: 'relationship',
          relationTo: 'media',
          hasMany: true,
        },
        {
          name: 'notes',
          label: 'Folder notes',
          type: 'richText',
        },
      ],
    },
    {
      name: 'visitNotes',
      label: 'Visit notes',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'appointment',
          type: 'relationship',
          relationTo: 'appointments',
          required: true,
        },
        {
          name: 'note',
          type: 'textarea',
          required: true,
        },
        {
          name: 'isPrivate',
          type: 'checkbox',
          label: 'Private note',
          defaultValue: true,
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'User who created the note. Defaults to the currently authenticated staff member.',
          },
        },
        {
          name: 'createdAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'prescriptions',
      label: 'Prescriptions',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'medication',
          type: 'text',
          required: true,
        },
        {
          name: 'dosage',
          type: 'text',
        },
        {
          name: 'instructions',
          type: 'textarea',
        },
        {
          name: 'issuedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'prescribedBy',
          type: 'relationship',
          relationTo: 'providers',
          required: true,
        },
        {
          name: 'refills',
          type: 'number',
          min: 0,
          defaultValue: 0,
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
        },
        {
          name: 'document',
          label: 'Signed prescription document',
          type: 'relationship',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'themePreferences',
      type: 'group',
      label: 'Theme preferences',
      fields: [
        {
          name: 'colorScheme',
          type: 'select',
          defaultValue: 'system',
          options: [
            { label: 'System default', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
            { label: 'High contrast', value: 'high-contrast' },
          ],
        },
        {
          name: 'accentColor',
          type: 'text',
          admin: {
            description: 'Tailwind-compatible accent color token (e.g. emerald, sky, violet).',
          },
        },
        {
          name: 'density',
          type: 'select',
          defaultValue: 'comfortable',
          options: [
            { label: 'Compact', value: 'compact' },
            { label: 'Comfortable', value: 'comfortable' },
            { label: 'Spacious', value: 'spacious' },
          ],
        },
      ],
    },
    {
      name: 'sharingPreferences',
      type: 'group',
      label: 'Sharing preferences',
      fields: [
        {
          name: 'allowPatientDownload',
          type: 'checkbox',
          label: 'Allow patient to download documents',
          defaultValue: false,
        },
        {
          name: 'allowPatientNotes',
          type: 'checkbox',
          label: 'Allow patient to view visit notes',
          defaultValue: false,
        },
      ],
    },
  ],
};

export default Patients;
