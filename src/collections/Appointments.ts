import type { CollectionAfterChangeHook, CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import type { PayloadRequest } from 'payload/dist/types/index.js'

import type { Service as ServiceDoc } from '../payload-types'
import { bookingHold } from '../lib/redis'

const generateReference = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `APT-${timestamp}-${random}`
}

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
        const value = (doc as { id?: unknown }).id
        if (typeof value === 'string' || typeof value === 'number') {
          return String(value)
        }
      }

      return null
    })
    .filter((id): id is string => typeof id === 'string')

  return ids
}

const extractRelationshipId = (value: unknown): string | null => {
  if (!value) return null

  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'object') {
    if ('id' in (value as Record<string, unknown>) && typeof (value as Record<string, unknown>).id !== 'undefined') {
      return String((value as Record<string, unknown>).id)
    }
    if ('value' in (value as Record<string, unknown>) && typeof (value as Record<string, unknown>).value !== 'undefined') {
      return String((value as Record<string, unknown>).value)
    }
  }

  return null
}

const serviceSchedulingHook: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  if (!data) return data

  const serviceRelation = data.service ?? originalDoc?.service
  const serviceId = extractRelationshipId(serviceRelation)

  if (!serviceId) {
    if (!data.reference) {
      data.reference = originalDoc?.reference ?? generateReference()
    }
    if (!data.pricingSnapshot) {
      data.pricingSnapshot = {
        amount: data.pricingSnapshot?.amount ?? 0,
        currency: data.pricingSnapshot?.currency ?? 'USD',
        durationMinutes: data.pricingSnapshot?.durationMinutes ?? 0,
        taxRate: data.pricingSnapshot?.taxRate,
      }
    }
    return data
  }

  let service: ServiceDoc | null = null
  try {
    service = (await req.payload.findByID({
      collection: 'services',
      id: serviceId,
      depth: 0,
    })) as ServiceDoc
  } catch {
    if (!data.reference) {
      data.reference = originalDoc?.reference ?? generateReference()
    }
    if (!data.pricingSnapshot) {
      data.pricingSnapshot = {
        amount: data.pricingSnapshot?.amount ?? 0,
        currency: data.pricingSnapshot?.currency ?? 'USD',
        durationMinutes: data.pricingSnapshot?.durationMinutes ?? 0,
        taxRate: data.pricingSnapshot?.taxRate,
      }
    }
    return data
  }

  const schedule = {
    ...originalDoc?.schedule,
    ...data.schedule,
  }

  if (service?.durationMinutes) {
    const startISO = schedule?.start

    if (startISO && !schedule?.end) {
      const start = new Date(startISO)
      if (!Number.isNaN(start.getTime())) {
        const end = new Date(start.getTime() + service.durationMinutes * 60 * 1000)
        schedule.start = start.toISOString()
        schedule.end = end.toISOString()
        schedule.durationMinutes = Math.max(Math.round((end.getTime() - start.getTime()) / 60000), 0)
      }
    }
  }

  if (schedule.start && schedule.end && !schedule.durationMinutes) {
    const start = new Date(schedule.start)
    const end = new Date(schedule.end)
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      schedule.durationMinutes = Math.max(Math.round((end.getTime() - start.getTime()) / 60000), 0)
    }
  }

  schedule.timeZone = schedule.timeZone ?? 'UTC'
  schedule.bufferBefore = schedule.bufferBefore ?? service?.bufferMinutesBefore ?? 0
  schedule.bufferAfter = schedule.bufferAfter ?? service?.bufferMinutesAfter ?? 0

  data.schedule = schedule

  const pricing = {
    amount: data.pricingSnapshot?.amount ?? service?.pricing?.amount ?? 0,
    currency: data.pricingSnapshot?.currency ?? service?.pricing?.currency ?? 'USD',
    durationMinutes: data.pricingSnapshot?.durationMinutes ?? service?.durationMinutes ?? 0,
    taxRate: data.pricingSnapshot?.taxRate ?? service?.pricing?.taxRate,
  }

  data.pricingSnapshot = pricing

  if (!data.provider && Array.isArray(service?.providers) && service.providers.length === 1) {
    const [firstProvider] = service.providers
    const providerValue = firstProvider?.value

    if (typeof providerValue === 'string') {
      data.provider = {
        relationTo: 'providers',
        value: providerValue,
      }
    } else if (providerValue && typeof providerValue === 'object') {
      const candidate = (providerValue as { id?: unknown }).id
      if (typeof candidate === 'string' || typeof candidate === 'number') {
        data.provider = {
          relationTo: 'providers',
          value: String(candidate),
        }
      }
    }
  }

  if (!data.reference) {
    data.reference = originalDoc?.reference ?? generateReference()
  }

  return data
}

const releaseBookingHoldAfterCreate: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const serviceId = extractRelationshipId(doc?.service)
  const slot = typeof doc?.schedule === 'object' && doc?.schedule !== null ? (doc.schedule as { start?: unknown }).start : null
  const slotStart = typeof slot === 'string' ? slot : null

  if (!serviceId || !slotStart) {
    return doc
  }

  try {
    await bookingHold.release({
      serviceId,
      slot: slotStart,
    })
  } catch (error) {
    req.payload.logger.error?.('Failed to release booking hold after appointment creation', error)
  }

  return doc
}

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  labels: {
    singular: 'Appointment',
    plural: 'Appointments',
  },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['status', 'provider', 'service', 'schedule.start', 'client'],
  },
  hooks: {
    beforeValidate: [serviceSchedulingHook],
    afterChange: [releaseBookingHoldAfterCreate],
  },
  access: {
    read: async ({ req }) => {
      if (!req.user) return false
      if (isAdmin(req.user)) return true

      const providerIds = await getProviderIdsForUser(req)
      const orConstraints: Record<string, unknown>[] = [
        {
          client: {
            equals: req.user.id,
          },
        },
      ]

      if (providerIds.length > 0) {
        orConstraints.push({
          provider: {
            in: providerIds,
          },
        })
      }

      return { or: orConstraints }
    },
    create: ({ req }) => Boolean(req.user),
    update: async ({ req }) => {
      if (!req.user) return false
      if (isAdmin(req.user)) return true

      const providerIds = await getProviderIdsForUser(req)
      const constraints: Record<string, unknown>[] = [
        {
          client: {
            equals: req.user.id,
          },
        },
      ]

      if (providerIds.length > 0) {
        constraints.push({
          provider: {
            in: providerIds,
          },
        })
      }

      return { or: constraints }
    },
    delete: async ({ req }) => {
      if (!req.user) return false
      if (isAdmin(req.user)) return true

      const providerIds = await getProviderIdsForUser(req)
      const constraints: Record<string, unknown>[] = [
        {
          client: {
            equals: req.user.id,
          },
        },
      ]

      if (providerIds.length > 0) {
        constraints.push({
          provider: {
            in: providerIds,
          },
        })
      }

      return { or: constraints }
    },
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Optional external reference or confirmation number.',
      },
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'provider',
      type: 'relationship',
      relationTo: 'providers',
      required: true,
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'No-show', value: 'no_show' },
      ],
    },
    {
      name: 'schedule',
      type: 'group',
      required: true,
      fields: [
        {
          name: 'start',
          type: 'date',
          required: true,
        },
        {
          name: 'end',
          type: 'date',
          required: true,
        },
        {
          name: 'timeZone',
          type: 'text',
          required: true,
          defaultValue: 'UTC',
        },
        {
          name: 'location',
          type: 'text',
        },
        {
          name: 'bufferBefore',
          type: 'number',
          min: 0,
          defaultValue: 0,
        },
        {
          name: 'bufferAfter',
          type: 'number',
          min: 0,
          defaultValue: 0,
        },
        {
          name: 'durationMinutes',
          type: 'number',
          min: 0,
          admin: {
            readOnly: true,
            description: 'Calculated from start and end times.',
          },
        },
      ],
    },
    {
      name: 'pricingSnapshot',
      type: 'group',
      label: 'Pricing snapshot',
      fields: [
        {
          name: 'amount',
          type: 'number',
          min: 0,
          required: true,
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
        },
        {
          name: 'durationMinutes',
          type: 'number',
          min: 0,
          required: true,
        },
        {
          name: 'taxRate',
          type: 'number',
          min: 0,
        },
      ],
    },
    {
      name: 'clientNotes',
      type: 'textarea',
      label: 'Client notes',
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      label: 'Internal notes',
      admin: {
        description: 'Visible only to staff users.',
      },
    },
    {
      name: 'cancellation',
      type: 'group',
      admin: {
        condition: (data) => data?.status === 'cancelled',
      },
      fields: [
        {
          name: 'cancelledAt',
          type: 'date',
        },
        {
          name: 'reason',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'reminders',
      type: 'array',
      label: 'Reminder events',
      fields: [
        {
          name: 'sentAt',
          type: 'date',
        },
        {
          name: 'channel',
          type: 'select',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'SMS', value: 'sms' },
            { label: 'Push notification', value: 'push' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'Sent', value: 'sent' },
            { label: 'Failed', value: 'failed' },
          ],
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional structured data synced from integrations.',
      },
    },
  ],
}
