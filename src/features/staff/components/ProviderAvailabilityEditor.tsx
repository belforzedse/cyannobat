'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'

import { Button, Card, Input, Select, useToast } from '@/components/ui'
import { glassPanelStyles } from '@/components/ui/glass'
import { cn } from '@/lib/utils'
import { useGlobalLoadingOverlay } from '@/components/GlobalLoadingOverlayProvider'
import type {
  StaffProvider,
  StaffProviderAvailabilityWindow,
  StaffUser,
} from '@/features/staff/types'

const DAY_OPTIONS = [
  { value: 'saturday', label: 'شنبه' },
  { value: 'sunday', label: 'یکشنبه' },
  { value: 'monday', label: 'دوشنبه' },
  { value: 'tuesday', label: 'سه‌شنبه' },
  { value: 'wednesday', label: 'چهارشنبه' },
  { value: 'thursday', label: 'پنج‌شنبه' },
  { value: 'friday', label: 'جمعه' },
] as const

const DAY_LABEL_LOOKUP = DAY_OPTIONS.reduce<Record<string, string>>((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

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

type ProviderAvailabilityEditorProps = {
  providers: StaffProvider[]
  currentUser: StaffUser
  onRefreshProviders?: () => Promise<StaffProvider[] | void>
}

type DraftState = Record<string, StaffProviderAvailabilityWindow[]>
type ErrorState = Record<string, string | null>

type ErrorWithCode = Error & { code?: string }

const ProviderAvailabilityEditor = ({
  providers,
  currentUser,
  onRefreshProviders,
}: ProviderAvailabilityEditorProps) => {
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

  const validateWindows = useCallback((windows: StaffProviderAvailabilityWindow[]): string | null => {
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
  }, [])

  const handleAddWindow = useCallback(
    (providerId: string) => {
      updateDraft(providerId, (current) => [...current, getDefaultWindow()])
    },
    [updateDraft],
  )

  const handleWindowChange = useCallback(
    (providerId: string, index: number, field: keyof StaffProviderAvailabilityWindow, value: string) => {
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

  const handleRemoveWindow = useCallback(
    (providerId: string, index: number) => {
      updateDraft(providerId, (current) => current.filter((_, position) => position !== index))
    },
    [updateDraft],
  )

  const handleSaveProvider = useCallback(
    async (provider: StaffProvider) => {
      const draftWindows = drafts[provider.id] ?? []
      const validationError = validateWindows(draftWindows)

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
    [drafts, onRefreshProviders, setActivity, showToast, validateWindows],
  )

  if (providers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/10 p-6 text-center text-sm text-muted-foreground dark:border-white/10">
        هنوز پروفایل ارائه‌دهنده‌ای ثبت نشده است.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => {
        const draftWindows = drafts[provider.id] ?? []
        const canEdit = canEditProvider(provider)
        const hasChanges = providerHasChanges(provider)
        const isSaving = savingProviderId === provider.id
        const errorMessage = errorMessages[provider.id] ?? null

        return (
          <Card
            key={provider.id}
            variant="subtle"
            padding="sm"
            className="flex flex-col gap-3 transition-transform hover:scale-[1.01] sm:p-6"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">{provider.displayName}</span>
              <span className="text-[11px] text-muted-foreground">منطقه زمانی: {provider.timeZone}</span>
            </div>

            {canEdit ? (
              <div className="flex flex-col gap-3">
                {draftWindows.length > 0 ? (
                  draftWindows.map((window, index) => (
                    <div
                      key={`${provider.id}-${index}`}
                      className="space-y-2 rounded-xl border border-white/20 bg-white/10 p-3 text-[11px] dark:border-white/15 dark:bg-white/5"
                    >
                      <Select
                        value={window.day}
                        onChange={(event) => handleWindowChange(provider.id, index, 'day', event.target.value)}
                        options={DAY_OPTIONS.map((option) => ({
                          value: option.value,
                          label: option.label,
                        }))}
                        aria-label="روز هفته"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="time"
                          value={window.startTime}
                          onChange={(event) => handleWindowChange(provider.id, index, 'startTime', event.target.value)}
                          aria-label="زمان شروع"
                        />
                        <Input
                          type="time"
                          value={window.endTime}
                          onChange={(event) => handleWindowChange(provider.id, index, 'endTime', event.target.value)}
                          aria-label="زمان پایان"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRemoveWindow(provider.id, index)}
                          leftIcon={<X className="h-4 w-4" />}
                          disabled={isSaving}
                        >
                          حذف بازه
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/20 px-3 py-5 text-center text-[11px] text-muted-foreground dark:border-white/15">
                    هنوز بازه‌ای برای این ارائه‌دهنده ثبت نشده است.
                  </div>
                )}

                {errorMessage && (
                  <p className="text-right text-xs text-red-500">{errorMessage}</p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddWindow(provider.id)}
                    leftIcon={<Plus className="h-4 w-4" />}
                    disabled={isSaving}
                  >
                    افزودن بازه
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSaveProvider(provider)}
                    disabled={isSaving || !hasChanges}
                    isLoading={isSaving}
                  >
                    ذخیره تغییرات
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-[11px]">
                {provider.availability.length > 0 ? (
                  provider.availability.map((window, index) => (
                    <div
                      key={`${provider.id}-${window.day}-${index}`}
                      className={cn(glassPanelStyles(), 'rounded-xl px-3 py-2')}
                    >
                      <span className="font-semibold text-foreground">
                        {DAY_LABEL_LOOKUP[window.day] ?? window.day}
                      </span>
                      <span className="mx-1 text-muted-foreground/60">—</span>
                      <span>
                        {window.startTime} تا {window.endTime}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/20 px-3 py-2 text-muted-foreground dark:border-white/15">
                    بازه‌ای ثبت نشده است.
                  </div>
                )}
                <p className="text-right text-[11px] text-muted-foreground">
                  برای ویرایش این بازه‌ها به نقش پذیرش یا مدیریت نیاز دارید.
                </p>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

export default ProviderAvailabilityEditor
