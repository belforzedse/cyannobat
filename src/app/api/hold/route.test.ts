import { beforeEach, describe, expect, it, vi } from 'vitest'

const getMock = vi.fn()
const releaseMock = vi.fn()

class MockBookingHoldStoreError extends Error {}

vi.mock('@/lib/redis', () => ({
  bookingHold: {
    get: getMock,
    release: releaseMock,
    create: vi.fn(),
    extend: vi.fn(),
    exists: vi.fn(),
    key: vi.fn(),
  },
  BookingHoldStoreError: MockBookingHoldStoreError,
  BookingHoldConflictError: class extends Error {},
}))

vi.mock('@payload-config', () => ({
  default: {},
  payloadDrizzle: {},
}))

describe('booking hold DELETE handler', () => {
  beforeEach(() => {
    getMock.mockReset()
    releaseMock.mockReset()
  })

  it('prevents releasing a hold owned by a different customer', async () => {
    const { DELETE } = await import('./route')
    getMock.mockResolvedValue({
      serviceId: 'service-123',
      slot: '2024-05-06T10:00:00.000Z',
      ttlSeconds: 300,
      createdAt: '2024-05-05T09:00:00.000Z',
      customerId: 'owner-123',
    })

    const response = await DELETE(
      new Request('http://localhost/api/hold', {
        method: 'DELETE',
        body: JSON.stringify({
          serviceId: 'service-123',
          slot: '2024-05-06T10:00:00.000Z',
          customerId: 'intruder-456',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      message: 'Unable to release booking hold',
      reasons: ['HOLD_RESERVED_FOR_DIFFERENT_CUSTOMER'],
      released: false,
    })
    expect(releaseMock).not.toHaveBeenCalled()
  })

  it('releases a hold when the customerId matches the stored hold', async () => {
    const { DELETE } = await import('./route')
    getMock.mockResolvedValue({
      serviceId: 'service-123',
      slot: '2024-05-06T10:00:00.000Z',
      ttlSeconds: 300,
      createdAt: '2024-05-05T09:00:00.000Z',
      customerId: 'owner-123',
    })
    releaseMock.mockResolvedValue(true)

    const response = await DELETE(
      new Request('http://localhost/api/hold', {
        method: 'DELETE',
        body: JSON.stringify({
          serviceId: 'service-123',
          slot: '2024-05-06T10:00:00.000Z',
          customerId: 'owner-123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      message: 'Booking hold released',
      released: true,
    })
    expect(releaseMock).toHaveBeenCalledWith({
      serviceId: 'service-123',
      slot: '2024-05-06T10:00:00.000Z',
    })
  })
})
