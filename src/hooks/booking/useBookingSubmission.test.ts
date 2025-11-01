import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useBookingSubmission } from './useBookingSubmission'
import type { SelectedSchedule } from '@/lib/booking/types'

type FetchMock = ReturnType<typeof vi.fn>

describe('useBookingSubmission', () => {
  const originalFetch = global.fetch
  let fetchMock: FetchMock

  const createSchedule = (): SelectedSchedule => {
    const slot = {
      id: 'slot-1',
      start: '2025-01-01T09:00:00Z',
      end: '2025-01-01T09:30:00Z',
      kind: 'in_person' as const,
      timeZone: 'UTC',
      providerId: 'provider-1',
      providerName: 'دکتر نمونه',
      serviceId: 'service-1',
      serviceName: 'ویزیت عمومی',
    }

    const day = {
      date: '2025-01-01',
      slots: [slot],
    }

    return { day, slot }
  }

  const createBaseProps = () => {
    const setActivity = vi.fn()
    const showToast = vi.fn()
    const router = { push: vi.fn() }

    return {
      props: {
        additionalReason: '',
        customerInfo: { fullName: 'کاربر آزمایشی', email: 'test@example.com', phone: '0211234567' },
        customerNotes: '',
        reasonSummary: ['دلیل ۱'],
        router,
        selectedReasons: ['reason-1'],
        selectedSchedule: createSchedule(),
        setActivity,
        showToast,
        isContinueDisabled: false,
      },
      setActivity,
      showToast,
      router,
    }
  }

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock as unknown as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('captures validation reasons when hold request fails', async () => {
    const { props, setActivity } = createBaseProps()

    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ reasons: ['ALREADY_BOOKED'] }),
    } as unknown as Response)

    const { result } = renderHook(() => useBookingSubmission(props))

    await act(async () => {
      await result.current.handleContinue()
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.submitError).toBe('امکان نگه‌داشت موقت نوبت وجود ندارد. لطفاً دوباره تلاش کنید.')
    expect(result.current.validationErrors).toContain('این زمان پیش‌تر رزرو شده است.')
    expect(setActivity).toHaveBeenCalledWith('booking-submit', true, 'در حال نهایی‌سازی نوبت...')
    expect(setActivity).toHaveBeenCalledWith('booking-submit', false)
  })

  it('releases hold and reports errors when booking request fails', async () => {
    const { props, setActivity, router, showToast } = createBaseProps()

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hold: { serviceId: 'service-1', slot: '2025-01-01T09:00:00Z', customerId: 'customer-123' },
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ errors: [{ message: 'Server error' }] }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        status: 200,
      } as unknown as Response)

    const { result } = renderHook(() => useBookingSubmission(props))

    await act(async () => {
      await result.current.handleContinue()
    })

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/api/hold',
      expect.objectContaining({ method: 'DELETE' }),
    )
    expect(result.current.submitError).toBe('ثبت نهایی نوبت با خطا مواجه شد. لطفاً دوباره تلاش کنید.')
    expect(result.current.validationErrors).toContain('Server error')
    expect(result.current.bookingReference).toBeNull()
    expect(router.push).not.toHaveBeenCalled()
    expect(showToast).not.toHaveBeenCalled()
    expect(setActivity).toHaveBeenCalledWith('booking-submit', true, 'در حال نهایی‌سازی نوبت...')
    expect(setActivity).toHaveBeenCalledWith('booking-submit', false)
  })
})
