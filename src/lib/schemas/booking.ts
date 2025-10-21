import { z } from 'zod'

const serviceIdSchema = z.string({ required_error: 'serviceId is required' }).min(1, 'serviceId is required')
const slotSchema = z
  .string({ required_error: 'slot is required' })
  .datetime({ message: 'slot must be an ISO 8601 date string' })
const metadataSchema = z.record(z.unknown(), {
  invalid_type_error: 'metadata must be an object',
})

export const bookingAvailabilityQuerySchema = z.object({
  serviceId: serviceIdSchema,
  slot: slotSchema,
})

export type BookingAvailabilityQueryInput = z.infer<typeof bookingAvailabilityQuerySchema>

export const bookingHoldReleaseSchema = z
  .object({
    serviceId: serviceIdSchema,
    slot: slotSchema,
    customerId: z
      .string({ required_error: 'customerId is required' })
      .min(1, 'customerId is required'),
  })
  .strict()

export type BookingHoldReleaseInput = z.infer<typeof bookingHoldReleaseSchema>

export const bookingHoldRequestSchema = z
  .object({
    serviceId: serviceIdSchema,
    slot: slotSchema,
    ttlSeconds: z
      .number({ invalid_type_error: 'ttlSeconds must be a number' })
      .int('ttlSeconds must be an integer')
      .positive('ttlSeconds must be greater than zero')
      .max(60 * 60, 'ttlSeconds cannot exceed one hour')
      .default(5 * 60),
    customerId: z.string().min(1).optional(),
    providerId: z.string().min(1).optional(),
    metadata: metadataSchema.optional(),
  })
  .strict()

export type BookingHoldRequestInput = z.infer<typeof bookingHoldRequestSchema>

export const bookingRequestSchema = z
  .object({
    serviceId: serviceIdSchema,
    slot: slotSchema,
    clientId: z.string({ required_error: 'clientId is required' }).min(1, 'clientId is required'),
    providerId: z.string().min(1).optional(),
    status: z
      .enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
      .optional()
      .default('confirmed'),
    timeZone: z.string().optional().default('UTC'),
    clientNotes: z.string().max(2000).optional(),
    metadata: metadataSchema.optional(),
  })
  .strict()

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>
