import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { progressSteps, reasonOptions, schedulePlaceholderMessage } from '@/lib/booking/constants'
import {
  type AvailabilityCalendarResponse,
  type AvailabilityDay,
  type AvailabilitySlot,
  type CustomerInfo,
  type ProgressStepWithStatus,
  type SelectedSchedule,
  type StepStatus,
  type ServiceOption,
} from '@/lib/booking/types'

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

type ServicesListResponse = {
  docs?: Array<{
    id: string | number
    title?: string | null
    category?: string | null
    durationMinutes?: number | null
    isActive?: boolean | null
  }>
}

export const useBookingState = () => {
  const [services, setServices] = useState<ServiceOption[]>([])
  const [isServicesLoading, setIsServicesLoading] = useState<boolean>(true)
  const [servicesError, setServicesError] = useState<string | null>(null)

  const [availability, setAvailability] = useState<AvailabilityDay[]>([])
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState<boolean>(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
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
  const servicesAbortControllerRef = useRef<AbortController | null>(null)
  const availabilityAbortControllerRef = useRef<AbortController | null>(null)

  const fetchServices = useCallback(async () => {
    servicesAbortControllerRef.current?.abort()
    const controller = new AbortController()
    servicesAbortControllerRef.current = controller
    setIsServicesLoading(true)
    setServicesError(null)

    const params = new URLSearchParams({ limit: '100', depth: '0', sort: 'title' })
    params.set('where[isActive][equals]', 'true')

    try {
      const response = await fetch(`/api/services?${params.toString()}`, {
        cache: 'no-store',
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Failed to load services (${response.status})`)
      }

      const payload = (await response.json()) as ServicesListResponse
      const normalized = (payload.docs ?? [])
        .filter((doc) => doc && (doc.isActive ?? true))
        .map((doc) => ({
          id: String(doc.id),
          title: doc.title?.trim() ? doc.title : 'خدمت بدون عنوان',
          category: doc.category ?? null,
          durationMinutes: doc.durationMinutes ?? null,
        }))

      setServices(normalized)
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') {
        return
      }
      setServices([])
      setServicesError('بارگذاری خدمات با مشکل روبه‌رو شد. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsServicesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
    return () => {
      servicesAbortControllerRef.current?.abort()
    }
  }, [fetchServices])

  const fetchAvailability = useCallback(async () => {
    availabilityAbortControllerRef.current?.abort()

    if (!selectedServiceId) {
      availabilityAbortControllerRef.current = null
      setAvailability([])
      setIsAvailabilityLoading(false)
      setAvailabilityError(null)
      return
    }

    const controller = new AbortController()
    availabilityAbortControllerRef.current = controller
    setIsAvailabilityLoading(true)
    setAvailabilityError(null)

    const params = new URLSearchParams({ rangeDays: '21', serviceId: selectedServiceId })

    try {
      const response = await fetch(`/api/availability/calendar?${params.toString()}`, {
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
  }, [selectedServiceId])

  useEffect(() => {
    fetchAvailability()
    return () => {
      availabilityAbortControllerRef.current?.abort()
    }
  }, [fetchAvailability])

  useEffect(() => {
    if (!selectedServiceId) {
      setSelectedDay(null)
      setSelectedSchedule(null)
      return
    }

    if (!services.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(null)
      setSelectedDay(null)
      setSelectedSchedule(null)
    }
  }, [selectedServiceId, services])

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

  const handleServiceSelect = useCallback((serviceId: string) => {
    setSelectedServiceId((prev) => {
      if (prev === serviceId) {
        return prev
      }

      setSelectedDay(null)
      setSelectedSchedule(null)
      setAvailability([])

      return serviceId
    })
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

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [selectedServiceId, services],
  )

  const isServiceComplete = Boolean(selectedServiceId)
  const isScheduleComplete = Boolean(selectedSchedule)
  const isReasonComplete = selectedReasons.length > 0 || additionalReason.trim().length > 0
  const isCustomerComplete = Object.values(customerInfo).every((value) => value.trim().length > 0)

  const stepsWithStatus: ProgressStepWithStatus[] = useMemo(() => {
    const completionMap: Record<typeof progressSteps[number]['key'], boolean> = {
      service: isServiceComplete,
      dateTime: isScheduleComplete,
      reason: isReasonComplete,
      customer: isCustomerComplete,
    }

    const activeIndex = progressSteps.findIndex((step) => !completionMap[step.key])

    const resolvedActiveIndex = activeIndex === -1 ? progressSteps.length - 1 : activeIndex

    return progressSteps.map((step, index) => {
      const complete = completionMap[step.key]

      const status: StepStatus = complete ? 'complete' : index === resolvedActiveIndex ? 'current' : 'upcoming'

      return { ...step, status, index }
    })
  }, [isCustomerComplete, isReasonComplete, isScheduleComplete, isServiceComplete])

  const formattedDate = useMemo(
    () => (selectedSchedule ? formatDateLabel(selectedSchedule.day.date) : formatDateLabel(selectedDay)),
    [selectedDay, selectedSchedule],
  )

  const formattedTime = useMemo(
    () => formatTimeRange(selectedSchedule?.slot ?? null),
    [selectedSchedule],
  )

  const selectedServiceLabel = selectedService?.title ?? selectedSchedule?.slot.serviceName ?? ''
  const selectedProviderLabel = selectedSchedule?.slot.providerName ?? ''

  const isContinueDisabled = !isServiceComplete || !isScheduleComplete || !isReasonComplete || !isCustomerComplete

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
    services,
    servicesLoading: isServicesLoading,
    servicesError,
    refreshServices: fetchServices,
    selectedServiceId,
    handleServiceSelect,
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
    isServiceComplete,
    isScheduleComplete,
    isReasonComplete,
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
