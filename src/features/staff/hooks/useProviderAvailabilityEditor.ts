'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useGlobalLoadingOverlay } from '@/components/GlobalLoadingOverlayProvider'
import { useToast } from '@/components/ui'
import { DAY_OPTIONS } from '@/features/staff/constants/providerAvailability'
import type {
  StaffProvider,
  StaffProviderAvailabilityWindow,
  StaffUser,
} from '@/features/staff/types'

type DraftState = Record<string, StaffProviderAvailabilityWindow[]>
type ErrorState = Record<string, string | null>

type ErrorWithCode = Error & { code?: string }

type Params = {
  providers: StaffProvider[]
  currentUser: StaffUser
  onRefreshProviders?: () => Promise<StaffProvider[] | void>
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.NaN
  }
  return hours * 60 + minutes
}

const getDefaultWindow = (): StaffProviderAvailabilityWindow => ({
  day: 'saturday',
  startTime: '09:00',
  endTime: '17:00',
})

export const validateAvailabilityWindows = (
  windows: StaffProviderAvailabilityWindow[],
): string | null => {
  const validDays = new Set<string>(DAY_OPTIONS.map((option) => option.value))

  for (const window of windows) {
    if (!validDays.has(window.day)) {
      return 'روز انتخاب شده معتبر نیست.'
    }

    if (!TIME_PATTERN.test(window.startTime) || !TIME_PATTERN.test(window.endTime)) {
      return 'زمان‌ها باید در قالب HH:MM باشند.'
    }

    if (!(toMinutes(window.endTime) > toMinutes(window.startTime))) {
      return 'زمان پایان باید بعد از زمان شروع باشد.'
    }
  }

  return null
}

export const useProviderAvailabilityEditor = ({
  providers,
  currentUser,
  onRefreshProviders,
}: Params) => {
  const [drafts, setDrafts] = useState<DraftState>({})
  const [errorMessages, setErrorMessages] = useState<ErrorState>({})
  const [savingProviderId, setSavingProviderId] = useState<string | null>(null)
  const { showToast } = useToast()
  const { setActivity } = useGlobalLoadingOverlay()

  useEffect(() => {
    setDrafts(() => {
      const initial: DraftState = {}
      providers.forEach((provider) => {
        initial[provider.id] = provider.availability.map((window) => ({ ...window }))
      })
      return initial
    })
    setErrorMessages({})
  }, [providers])

  const roles = currentUser.roles
  const canManageAll = useMemo(
    () => roles.includes('admin') || roles.includes('receptionist'),
    [roles],
  )

  const canEditProvider = useCallback(
    (provider: StaffProvider): boolean => {
      if (canManageAll) {
        return true
      }

      if (roles.includes('doctor')) {
        return provider.accountId === currentUser.id
      }

      return false
    },
    [canManageAll, currentUser.id, roles],
  )

  const updateDraft = useCallback(
    (
      providerId: string,
      updater: (current: StaffProviderAvailabilityWindow[]) => StaffProviderAvailabilityWindow[],
    ) => {
      setDrafts((current) => {
        const existing = current[providerId] ?? []
        const next = updater(existing.map((window) => ({ ...window })))
        return {
          ...current,
          [providerId]: next,
        }
      })
    },
    [],
  )

  const providerHasChanges = useCallback(
    (provider: StaffProvider) => {
      const original = JSON.stringify(provider.availability)
      const draft = JSON.stringify(drafts[provider.id] ?? [])
      return original !== draft
    },
    [drafts],
  )

  const addWindow = useCallback(
    (providerId: string) => {
      updateDraft(providerId, (current) => [...current, getDefaultWindow()])
    },
    [updateDraft],
  )

  const updateWindow = useCallback(
    (
      providerId: string,
      index: number,
      field: keyof StaffProviderAvailabilityWindow,
      value: string,
    ) => {
      updateDraft(providerId, (current) =>
        current.map((window, position) =>
          position === index
            ? {
                ...window,
                [field]: value,
              }
            : window,
        ),
      )
    },
    [updateDraft],
  )

  const removeWindow = useCallback(
    (providerId: string, index: number) => {
      updateDraft(providerId, (current) => current.filter((_, position) => position !== index))
    },
    [updateDraft],
  )

  const saveProvider = useCallback(
    async (provider: StaffProvider) => {
      const draftWindows = drafts[provider.id] ?? []
      const validationError = validateAvailabilityWindows(draftWindows)

      if (validationError) {
        setErrorMessages((current) => ({
          ...current,
          [provider.id]: validationError,
        }))
        return
      }

      const normalizedWindows = draftWindows.map((window) => ({
        day: window.day,
        startTime: window.startTime.trim(),
        endTime: window.endTime.trim(),
      }))

      setSavingProviderId(provider.id)
      setActivity(`staff-provider-save-${provider.id}`, true, 'در حال ذخیره بازه‌ها...')
      setErrorMessages((current) => ({
        ...current,
        [provider.id]: null,
      }))

      try {
        const response = await fetch(`/api/staff/providers/${provider.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ windows: normalizedWindows }),
        })

        if (!response.ok) {
          let errorMessage = 'ذخیره بازه‌ها ممکن نشد.'

          if (response.status === 400) {
            errorMessage = 'داده‌های ارسالی نامعتبر است.'
          } else if (response.status === 403) {
            errorMessage = 'اجازه ویرایش این ارائه‌دهنده را ندارید.'
          } else if (response.status === 404) {
            errorMessage = 'ارائه‌دهنده مورد نظر یافت نشد.'
          }

          const failure = new Error(errorMessage) as ErrorWithCode
          failure.code = 'SAVE_FAILED'
          throw failure
        }

        try {
          await onRefreshProviders?.()
        } catch (refreshError) {
          const failure = new Error('تغییرات ذخیره شد اما دریافت اطلاعات جدید ممکن نشد.') as ErrorWithCode
          failure.code = 'REFRESH_FAILED'
          failure.cause = refreshError
          throw failure
        }

        showToast({ description: 'بازه‌های زمانی با موفقیت ذخیره شد.', variant: 'success' })
        setErrorMessages((current) => ({
          ...current,
          [provider.id]: null,
        }))
      } catch (error) {
        console.error('Failed to update provider availability', error)
        const failure = error as ErrorWithCode
        const message = failure.message || 'ذخیره بازه‌ها ممکن نشد.'
        setErrorMessages((current) => ({
          ...current,
          [provider.id]: message,
        }))
        showToast({ description: message, variant: 'error' })
      } finally {
        setSavingProviderId(null)
        setActivity(`staff-provider-save-${provider.id}`, false)
      }
    },
    [drafts, onRefreshProviders, setActivity, showToast],
  )

  const getDraftWindows = useCallback(
    (providerId: string): StaffProviderAvailabilityWindow[] => drafts[providerId] ?? [],
    [drafts],
  )

  const getErrorMessage = useCallback(
    (providerId: string): string | null => errorMessages[providerId] ?? null,
    [errorMessages],
  )

  const isSavingProvider = useCallback(
    (providerId: string): boolean => savingProviderId === providerId,
    [savingProviderId],
  )

  return {
    dayOptions: DAY_OPTIONS,
    addWindow,
    canEditProvider,
    getDraftWindows,
    getErrorMessage,
    isSavingProvider,
    providerHasChanges,
    removeWindow,
    saveProvider,
    updateWindow,
  }
}
