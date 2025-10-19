import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { progressSteps, reasonOptions, schedulePlaceholderMessage } from '../constants'
import {
  type AvailabilityCalendarResponse,
  type AvailabilityDay,
  type AvailabilitySlot,
  type CustomerInfo,
  type ProgressStepWithStatus,
  type SelectedSchedule,
  type StepStatus,
} from '../types'

const formatDateLabel = (value: string | null) => {
  if (!value) {
    return 'زمانی انتخاب نشده است'
  }

  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(`${value}T00:00:00Z`))
  } catch {
    return value
  }
}

const formatTimeRange = (slot: AvailabilitySlot | null) => {
  if (!slot) {
    return 'زمانی انتخاب نشده است'
  }

  const formatter = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: slot.timeZone ?? 'UTC',
  })

  try {
    const start = formatter.format(new Date(slot.start))
    const end = formatter.format(new Date(slot.end))
    return `${start} تا ${end} — ${slot.providerName}`
  } catch {
    return `${slot.start} تا ${slot.end} — ${slot.providerName}`
  }
}

export const useBookingState = () => {
  const [availability, setAvailability] = useState<AvailabilityDay[]>([])
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState<boolean>(true)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<SelectedSchedule | null>(null)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [additionalReason, setAdditionalReason] = useState('')
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
  })
  const [customerNotes, setCustomerNotes] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchAvailability = useCallback(async () => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    setIsAvailabilityLoading(true)
    setAvailabilityError(null)

    try {
      const response = await fetch('/api/availability/calendar?rangeDays=21', {
        cache: 'no-store',
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Failed to load availability (${response.status})`)
      }

      const payload = (await response.json()) as AvailabilityCalendarResponse
      const sortedDays = payload.days
        .map((day) => ({
          ...day,
          slots: [...day.slots].sort((a, b) => a.start.localeCompare(b.start)),
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      setAvailability(sortedDays)
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') {
        return
      }
      setAvailability([])
      setAvailabilityError('بارگذاری زمان‌های آزاد با مشکل روبه‌رو شد. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsAvailabilityLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAvailability()
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [fetchAvailability])

  useEffect(() => {
    if (!selectedSchedule) return

    const nextDay = availability.find((day) => day.date === selectedSchedule.day.date)
    if (!nextDay) {
      setSelectedSchedule(null)
      setSelectedDay(null)
      return
    }

    const nextSlot = nextDay.slots.find((slot) => slot.id === selectedSchedule.slot.id)
    if (!nextSlot) {
      setSelectedSchedule(null)
      return
    }

    setSelectedSchedule({ day: nextDay, slot: nextSlot })
  }, [availability, selectedSchedule])

  const handleDaySelect = useCallback((day: AvailabilityDay) => {
    setSelectedDay(day.date)
    setSelectedSchedule((currentSchedule) => {
      if (currentSchedule && currentSchedule.day.date === day.date) {
        return currentSchedule
      }
      return null
    })
  }, [])

  const handleSlotSelect = useCallback((slot: AvailabilitySlot, day: AvailabilityDay) => {
    setSelectedDay(day.date)
    setSelectedSchedule({ day, slot })
  }, [])

  const handleReasonToggle = useCallback((value: string) => {
    setSelectedReasons((prev) => {
      if (prev.includes(value)) {
        return prev.filter((reason) => reason !== value)
      }
      return [...prev, value]
    })
  }, [])

  const handleCustomerChange = useCallback((field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
  }, [])

  const selectedReasonLabels = useMemo(
    () =>
      selectedReasons
        .map((reason) => reasonOptions.find((option) => option.value === reason)?.label ?? reason)
        .filter((label): label is string => Boolean(label)),
    [selectedReasons],
  )

  const isScheduleComplete = Boolean(selectedSchedule)
  const isReasonComplete = selectedReasons.length > 0 || additionalReason.trim().length > 0
  const isCustomerComplete = Object.values(customerInfo).every((value) => value.trim().length > 0)

  const stepsWithStatus: ProgressStepWithStatus[] = useMemo(() => {
    const activeIndex = progressSteps.findIndex((step) => {
      if (step.key === 'dateTime') return !isScheduleComplete
      if (step.key === 'reason') return !isReasonComplete
      return !isCustomerComplete
    })

    const resolvedActiveIndex = activeIndex === -1 ? progressSteps.length - 1 : activeIndex

    return progressSteps.map((step, index) => {
      const complete =
        step.key === 'dateTime' ? isScheduleComplete : step.key === 'reason' ? isReasonComplete : isCustomerComplete

      const status: StepStatus = complete ? 'complete' : index === resolvedActiveIndex ? 'current' : 'upcoming'

      return { ...step, status, index }
    })
  }, [isCustomerComplete, isReasonComplete, isScheduleComplete])

  const formattedDate = useMemo(
    () => (selectedSchedule ? formatDateLabel(selectedSchedule.day.date) : formatDateLabel(selectedDay)),
    [selectedDay, selectedSchedule],
  )

  const formattedTime = useMemo(
    () => formatTimeRange(selectedSchedule?.slot ?? null),
    [selectedSchedule],
  )

  const selectedServiceLabel = selectedSchedule?.slot.serviceName ?? ''
  const selectedProviderLabel = selectedSchedule?.slot.providerName ?? ''

  const isContinueDisabled = !isScheduleComplete || !isReasonComplete || !isCustomerComplete

  const reasonSummary = useMemo(
    () =>
      isReasonComplete
        ? [
            ...selectedReasonLabels,
            additionalReason.trim() ? `توضیحات: ${additionalReason.trim()}` : null,
          ].filter((value): value is string => Boolean(value))
        : [],
    [additionalReason, isReasonComplete, selectedReasonLabels],
  )

  const placeholderMessage = availabilityError ?? schedulePlaceholderMessage

  return {
    availabilityForSelection: availability,
    availabilityLoading: isAvailabilityLoading,
    availabilityError,
    refreshAvailability: fetchAvailability,
    selectedDay,
    selectedSchedule,
    handleDaySelect,
    handleSlotSelect,
    selectedReasons,
    handleReasonToggle,
    additionalReason,
    setAdditionalReason,
    customerInfo,
    handleCustomerChange,
    customerNotes,
    setCustomerNotes,
    stepsWithStatus,
    formattedDate,
    formattedTime,
    selectedServiceLabel,
    selectedProviderLabel,
    isContinueDisabled,
    isCustomerComplete,
    reasonSummary,
    schedulePlaceholderMessage: placeholderMessage,
  }
}
