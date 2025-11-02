import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { StaffProvider, StaffProviderAvailabilityWindow, StaffUser } from '@/lib/staff/types';

import {
  useProviderAvailabilityEditor,
  validateAvailabilityWindows,
} from './useProviderAvailabilityEditor';

const mockShowToast = vi.fn();
const mockSetActivity = vi.fn();

vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual<typeof import('@/components/ui')>('@/components/ui');
  return {
    ...actual,
    useToast: () => ({ showToast: mockShowToast }),
  };
});

vi.mock('@/components/GlobalLoadingOverlayProvider', async () => {
  const actual = await vi.importActual<typeof import('@/components/GlobalLoadingOverlayProvider')>(
    '@/components/GlobalLoadingOverlayProvider',
  );
  return {
    ...actual,
    useGlobalLoadingOverlay: () => ({ setActivity: mockSetActivity }),
  };
});

describe('validateAvailabilityWindows', () => {
  const validWindow: StaffProviderAvailabilityWindow = {
    day: 'saturday',
    startTime: '09:00',
    endTime: '12:00',
  };

  it('returns null when all windows are valid', () => {
    expect(validateAvailabilityWindows([validWindow])).toBeNull();
  });

  it('returns an error message for invalid days', () => {
    expect(validateAvailabilityWindows([{ ...validWindow, day: 'caturday' }])).toBe(
      'روز انتخاب شده معتبر نیست.',
    );
  });

  it('returns an error message when times do not match the HH:MM format', () => {
    expect(
      validateAvailabilityWindows([{ ...validWindow, startTime: '9:00', endTime: '12:00' }]),
    ).toBe('زمان‌ها باید در قالب HH:MM باشند.');
  });

  it('returns an error message when end time is not after start time', () => {
    expect(
      validateAvailabilityWindows([{ ...validWindow, startTime: '10:00', endTime: '09:00' }]),
    ).toBe('زمان پایان باید بعد از زمان شروع باشد.');
  });
});

describe('useProviderAvailabilityEditor', () => {
  const baseProvider: StaffProvider = {
    id: 'provider-1',
    displayName: 'دکتر نمونه',
    availability: [{ day: 'saturday', startTime: '09:00', endTime: '17:00' }],
    timeZone: 'Asia/Tehran',
    accountId: 'doctor-1',
  };

  const createUser = (roles: string[], overrides: Partial<StaffUser> = {}): StaffUser => ({
    id: 'user-1',
    email: 'user@example.com',
    roles,
    ...overrides,
  });

  beforeEach(() => {
    mockShowToast.mockReset();
    mockSetActivity.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('allows admins to edit any provider', () => {
    const providerB: StaffProvider = {
      ...baseProvider,
      id: 'provider-2',
      accountId: 'other-doctor',
    };
    const { result } = renderHook(() =>
      useProviderAvailabilityEditor({
        providers: [baseProvider, providerB],
        currentUser: createUser(['admin']),
      }),
    );

    expect(result.current.canEditProvider(baseProvider)).toBe(true);
    expect(result.current.canEditProvider(providerB)).toBe(true);
  });

  it('allows doctors to edit only their own provider profile', () => {
    const providerB: StaffProvider = { ...baseProvider, id: 'provider-2', accountId: 'doctor-2' };
    const { result } = renderHook(() =>
      useProviderAvailabilityEditor({
        providers: [baseProvider, providerB],
        currentUser: createUser(['doctor'], { id: 'doctor-1' }),
      }),
    );

    expect(result.current.canEditProvider(baseProvider)).toBe(true);
    expect(result.current.canEditProvider(providerB)).toBe(false);
  });

  it('prevents users without staff roles from editing providers', () => {
    const { result } = renderHook(() =>
      useProviderAvailabilityEditor({
        providers: [baseProvider],
        currentUser: createUser([]),
      }),
    );

    expect(result.current.canEditProvider(baseProvider)).toBe(false);
  });

  it('stores validation errors when saving invalid availability windows', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    const { result } = renderHook(() =>
      useProviderAvailabilityEditor({
        providers: [baseProvider],
        currentUser: createUser(['admin']),
      }),
    );

    act(() => {
      result.current.updateWindow('provider-1', 0, 'endTime', '08:30');
    });

    await act(async () => {
      await result.current.saveProvider(baseProvider);
    });

    expect(result.current.getErrorMessage('provider-1')).toBe(
      'زمان پایان باید بعد از زمان شروع باشد.',
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('surfaces permission errors returned by the server', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
    } as Response);

    const { result } = renderHook(() =>
      useProviderAvailabilityEditor({
        providers: [baseProvider],
        currentUser: createUser(['admin']),
      }),
    );

    await act(async () => {
      await result.current.saveProvider(baseProvider);
    });

    expect(result.current.getErrorMessage('provider-1')).toBe(
      'اجازه ویرایش این ارائه‌دهنده را ندارید.',
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith({
      description: 'اجازه ویرایش این ارائه‌دهنده را ندارید.',
      variant: 'error',
    });
  });
});
