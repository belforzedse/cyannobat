'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { Button } from '@/components/ui/Button'
import { GlassSurface } from '@/components/ui/glass'

import BookingStepper from '@/features/booking/components/BookingStepper'
import ScheduleSection from '@/features/booking/components/ScheduleSection'
import ReasonsSection from '@/features/booking/components/ReasonsSection'
import ContactSection from '@/features/booking/components/ContactSection'
import BookingSummary from '@/features/booking/components/BookingSummary'
import ServiceSection from '@/features/booking/components/ServiceSection'
import { reasonOptions } from '@/features/booking/constants'
import { useBookingState } from '@/features/booking/hooks/useBookingState'
import {
  GlobalLoadingOverlayProvider,
  useGlobalLoadingOverlay,
} from '@/components/GlobalLoadingOverlayProvider'
import { useToast } from '@/components/ui'

const HOLD_TTL_SECONDS = 5 * 60

const reasonMessages: Record<string, string> = {
  ALREADY_BOOKED: 'این زمان پیش‌تر رزرو شده است.',
  ALREADY_ON_HOLD: 'این زمان به طور موقت توسط کاربر دیگری نگه داشته شده است.',
  HOLD_NOT_FOUND: 'رزرو موقت معتبر یافت نشد. لطفاً دوباره تلاش کنید.',
  HOLD_RESERVED_FOR_DIFFERENT_CUSTOMER: 'این نوبت برای کاربر دیگری نگه داشته شده است.',
  HOLD_RESERVED_FOR_DIFFERENT_PROVIDER: 'این نوبت با پزشک دیگری هماهنگ شده است.',
  LEAD_TIME_NOT_MET: 'زمان انتخابی با محدودیت فاصله زمانی خدمت همخوانی ندارد.',
  PAST_SLOT: 'زمان انتخاب‌شده در گذشته است.',
  PROVIDER_NOT_AVAILABLE_FOR_SERVICE: 'پزشک انتخابی برای این خدمت در دسترس نیست.',
  PROVIDER_REQUIRED: 'انتخاب پزشک برای این رزرو ضروری است.',
  SERVICE_INACTIVE: 'این خدمت در حال حاضر فعال نیست.',
  SERVICE_NOT_FOUND: 'خدمت انتخابی یافت نشد.',
}

const BookingPageContent = () => {
  const reducedMotionSetting = useReducedMotion()
  const prefersReducedMotion = reducedMotionSetting ?? false
  const router = useRouter()
  const {
    services,
    servicesLoading,
    servicesError,
    refreshServices,
    selectedServiceId,
    handleServiceSelect,
    availabilityForSelection,
    availabilityLoading,
    availabilityError,
    refreshAvailability,
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
    schedulePlaceholderMessage,
  } = useBookingState()
  const { setActivity } = useGlobalLoadingOverlay()
  const { showToast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [bookingReference, setBookingReference] = useState<string | null>(null)

  const scheduleSectionRef = useRef<HTMLDivElement | null>(null)
  const reasonSectionRef = useRef<HTMLDivElement | null>(null)
  const contactSectionRef = useRef<HTMLDivElement | null>(null)
  const holdKeyRef = useRef<{ serviceId: string; slot: string; customerId: string } | null>(null)

  const sectionAnimation = {
    initial: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : -12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' },
  }

  const shouldShowScheduleSection = isServiceComplete
  const shouldShowReasonSection = isScheduleComplete
  const shouldShowContactSection = isReasonComplete
  const shouldShowSummarySection =
    isServiceComplete && isScheduleComplete && isReasonComplete && isCustomerComplete

  useEffect(() => {
    setActivity('booking-availability', availabilityLoading, 'در حال بررسی زمان‌های خالی...')
    return () => {
      setActivity('booking-availability', false)
    }
  }, [availabilityLoading, setActivity])

  const scrollToSection = useCallback(
    (sectionRef: { current: HTMLElement | null }) => {
      const element = sectionRef.current
      if (!element) return

      element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
    },
    [prefersReducedMotion],
  )

  const hasShownScheduleSectionRef = useRef(shouldShowScheduleSection)
  const hasShownReasonSectionRef = useRef(shouldShowReasonSection)
  const hasShownContactSectionRef = useRef(shouldShowContactSection)

  useEffect(() => {
    if (shouldShowScheduleSection && !hasShownScheduleSectionRef.current) {
      scrollToSection(scheduleSectionRef)
    }

    hasShownScheduleSectionRef.current = shouldShowScheduleSection
  }, [shouldShowScheduleSection, scrollToSection])

  useEffect(() => {
    if (shouldShowReasonSection && !hasShownReasonSectionRef.current) {
      scrollToSection(reasonSectionRef)
    }

    hasShownReasonSectionRef.current = shouldShowReasonSection
  }, [shouldShowReasonSection, scrollToSection])

  useEffect(() => {
    if (shouldShowContactSection && !hasShownContactSectionRef.current) {
      scrollToSection(contactSectionRef)
    }

    hasShownContactSectionRef.current = shouldShowContactSection
  }, [shouldShowContactSection, scrollToSection])

  const extractErrorMessages = useCallback((payload: unknown): string[] => {
    if (!payload || typeof payload !== 'object') return []

    const details: string[] = []
    if ('errors' in payload && Array.isArray((payload as { errors?: unknown }).errors)) {
      for (const issue of (payload as { errors?: unknown[] }).errors ?? []) {
        if (!issue || typeof issue !== 'object') continue
        if ('message' in issue && typeof issue.message === 'string') {
          details.push(issue.message)
        }
      }
    }

    if ('reasons' in payload && Array.isArray((payload as { reasons?: unknown }).reasons)) {
      for (const reason of (payload as { reasons?: unknown[] }).reasons ?? []) {
        if (typeof reason !== 'string') continue
        details.push(reasonMessages[reason] ?? reason)
      }
    }

    return details
  }, [])

  const releaseHold = useCallback(async () => {
    if (!holdKeyRef.current) {
      return
    }

    const holdKey = holdKeyRef.current

    try {
      const response = await fetch('/api/hold', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holdKey),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        console.warn('Failed to release booking hold', {
          status: response.status,
          payload,
        })
        showToast({
          variant: 'error',
          title: 'مشکل در آزادسازی نوبت',
          description: 'رزرو موقت آزاد نشد. در صورت تکرار، صفحه را تازه‌سازی کنید.',
        })
      }
    } catch (error) {
      console.error('Failed to release booking hold', error)
      showToast({
        variant: 'error',
        title: 'مشکل در آزادسازی نوبت',
        description: 'رزرو موقت آزاد نشد. در صورت تکرار، صفحه را تازه‌سازی کنید.',
      })
    } finally {
      holdKeyRef.current = null
    }
  }, [showToast])

  const handleContinue = useCallback(async () => {
    if (!selectedSchedule) {
      setSubmitError('لطفاً پیش از ادامه، زمان ملاقات را انتخاب کنید.')
      setValidationErrors([])
      return
    }

    const normalizedCustomer = {
      fullName: customerInfo.fullName.trim(),
      email: customerInfo.email.trim(),
      phone: customerInfo.phone.trim(),
    }

    const resolvedCustomerId = normalizedCustomer.email || normalizedCustomer.phone
    const trimmedNotes = customerNotes.trim()
    const trimmedAdditionalReason = additionalReason.trim()

    setIsSubmitting(true)
    setSubmitError(null)
    setValidationErrors([])
    setBookingReference(null)

    holdKeyRef.current = null

    try {
      setActivity('booking-submit', true, 'در حال نهایی‌سازی نوبت...')
      const slot = selectedSchedule.slot
      const holdResponse = await fetch('/api/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: slot.serviceId,
          slot: slot.start,
          ttlSeconds: HOLD_TTL_SECONDS,
          providerId: slot.providerId,
          customerId: resolvedCustomerId || undefined,
          metadata: {
            day: selectedSchedule.day.date,
            serviceName: slot.serviceName,
            providerName: slot.providerName,
            reasons: selectedReasons,
            reasonSummary,
            additionalReason: trimmedAdditionalReason || undefined,
            customerInfo: normalizedCustomer,
            customerNotes: trimmedNotes || undefined,
          },
        }),
      })

      const holdPayload = await holdResponse.json().catch(() => null)

      if (!holdResponse.ok) {
        setSubmitError('امکان نگه‌داشت موقت نوبت وجود ندارد. لطفاً دوباره تلاش کنید.')
        setValidationErrors(extractErrorMessages(holdPayload))
        return
      }

      if (
        holdPayload &&
        typeof holdPayload === 'object' &&
        'hold' in holdPayload &&
        holdPayload.hold &&
        typeof holdPayload.hold === 'object'
      ) {
        const hold = holdPayload.hold as { serviceId?: unknown; slot?: unknown; customerId?: unknown }
        if (
          typeof hold.serviceId === 'string' &&
          typeof hold.slot === 'string' &&
          typeof hold.customerId === 'string'
        ) {
          holdKeyRef.current = {
            serviceId: hold.serviceId,
            slot: hold.slot,
            customerId: hold.customerId,
          }
        }
      }

      const bookingResponse = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: slot.serviceId,
          slot: slot.start,
          clientId:
            (holdPayload && typeof holdPayload === 'object' && 'hold' in holdPayload
              ? (holdPayload as { hold?: { customerId?: string } }).hold?.customerId
              : null) ?? resolvedCustomerId,
          providerId: slot.providerId,
          timeZone: slot.timeZone,
          clientNotes: trimmedNotes || undefined,
          metadata: {
            reasons: selectedReasons,
            reasonSummary,
            additionalReason: trimmedAdditionalReason || undefined,
            customerInfo: normalizedCustomer,
          },
        }),
      })

      const bookingPayload = await bookingResponse.json().catch(() => null)

      if (!bookingResponse.ok) {
        await releaseHold()
        setSubmitError('ثبت نهایی نوبت با خطا مواجه شد. لطفاً دوباره تلاش کنید.')
        setValidationErrors(extractErrorMessages(bookingPayload))
        return
      }

      const appointmentReference =
        bookingPayload && typeof bookingPayload === 'object'
          ? (bookingPayload as { appointment?: { reference?: unknown } }).appointment?.reference
          : null

      const reference = typeof appointmentReference === 'string' ? appointmentReference : null

      setBookingReference(reference)
      setSubmitError(null)
      setValidationErrors([])

      if (reference) {
        router.push(`/reserve/confirmation?reference=${encodeURIComponent(reference)}`)
      } else {
        router.push('/reserve/confirmation')
      }
    } catch (error) {
      console.error('Failed to complete booking flow', error)
      await releaseHold()
      setSubmitError('ثبت نوبت با خطا مواجه شد. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsSubmitting(false)
      setActivity('booking-submit', false)
    }
  }, [
    additionalReason,
    customerInfo.email,
    customerInfo.fullName,
    customerInfo.phone,
    customerNotes,
    extractErrorMessages,
    reasonSummary,
    router,
    selectedReasons,
    releaseHold,
    selectedSchedule,
    setActivity,
  ])

  const isActionDisabled = isContinueDisabled || isSubmitting

  return (
    <GlassSurface
      as={motion.section}
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="relative flex min-h-dvh flex-col gap-6 overflow-hidden px-4 py-6 text-right sm:gap-12 sm:px-12 sm:py-12 lg:px-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-accent/25 blur-[140px] sm:-left-16 dark:bg-accent/35"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-16 h-80 w-80 rounded-full bg-accent-strong/25 blur-[150px] dark:bg-accent-strong/35"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70 dark:via-white/20"
      />

      <header className="flex flex-col items-end gap-3 sm:gap-5">
        <motion.span
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.1, duration: prefersReducedMotion ? 0 : 0.45 }}
          className="rounded-full border border-white/25 bg-white/20 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm dark:border-white/15 dark:bg-white/10"
        >
          مسیر رزرو نوبت
        </motion.span>
        <motion.h1
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
          className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
        >
          رزرو سریع وقت ملاقات
        </motion.h1>
        <motion.p
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
          className="max-w-2xl text-balance leading-relaxed text-muted-foreground"
        >
          از میان خدمات فعال، بازه زمانی مناسب خود را انتخاب کنید؛ ارائه‌دهنده مرتبط همراه هر بازه معرفی شده است. سپس
          علت مراجعه را بنویسید و اطلاعات تماس را ثبت نمایید. در پایان جزئیات را یک بار دیگر مرور کنید تا نوبت شما به‌صورت
          خودکار در سامانه ثبت شود.
        </motion.p>
      </header>

      <BookingStepper steps={stepsWithStatus} prefersReducedMotion={prefersReducedMotion} />

      <div
        className={clsx(
          'grid gap-6 sm:gap-8',
          shouldShowSummarySection &&
            'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)] lg:items-start lg:gap-12',
        )}
      >
        <form className="grid gap-4 sm:gap-6 lg:gap-8">
          <motion.div layout {...sectionAnimation} transition={{ ...sectionAnimation.transition, delay: 0 }}>
            <ServiceSection
              services={services}
              selectedServiceId={selectedServiceId}
              onSelectService={handleServiceSelect}
              isLoading={servicesLoading}
              errorMessage={servicesError}
              onRetry={refreshServices}
            />
          </motion.div>

        {shouldShowScheduleSection && (
          <motion.div
            key="booking-schedule"
            layout
            ref={scheduleSectionRef}
            {...sectionAnimation}
            transition={{ ...sectionAnimation.transition, delay: prefersReducedMotion ? 0 : 0.05 }}
          >
            <ScheduleSection
              availability={availabilityForSelection}
              selectedDay={selectedDay}
              selectedSlotId={selectedSchedule?.slot.id ?? null}
              onSelectDay={handleDaySelect}
              onSelectSlot={handleSlotSelect}
              placeholderMessage={schedulePlaceholderMessage}
              isLoading={availabilityLoading}
              errorMessage={availabilityError}
              onRetry={refreshAvailability}
            />
          </motion.div>
        )}

        {shouldShowReasonSection && (
          <motion.div
            key="booking-reasons"
            layout
            ref={reasonSectionRef}
            {...sectionAnimation}
            transition={{ ...sectionAnimation.transition, delay: prefersReducedMotion ? 0 : 0.1 }}
          >
            <ReasonsSection
              options={reasonOptions}
              selectedReasons={selectedReasons}
              onToggleReason={handleReasonToggle}
              additionalReason={additionalReason}
              onAdditionalReasonChange={(value) => setAdditionalReason(value)}
            />
          </motion.div>
        )}

        {shouldShowContactSection && (
          <motion.div
            key="booking-contact"
            layout
            ref={contactSectionRef}
            {...sectionAnimation}
            transition={{ ...sectionAnimation.transition, delay: prefersReducedMotion ? 0 : 0.15 }}
          >
            <ContactSection
              customerInfo={customerInfo}
              onCustomerChange={handleCustomerChange}
              customerNotes={customerNotes}
              onCustomerNotesChange={(value) => setCustomerNotes(value)}
            />
          </motion.div>
        )}
        </form>

        {shouldShowSummarySection && (
          <motion.div
            key="booking-summary"
            layout
            {...sectionAnimation}
            transition={{ ...sectionAnimation.transition, delay: prefersReducedMotion ? 0 : 0.2 }}
            className="lg:sticky lg:top-6"
          >
            <BookingSummary
              prefersReducedMotion={prefersReducedMotion}
              isContinueDisabled={isContinueDisabled}
              formattedDate={formattedDate}
              formattedTime={formattedTime}
              reasonSummary={reasonSummary}
              customerInfo={customerInfo}
              customerNotes={customerNotes}
              isCustomerComplete={isCustomerComplete}
              serviceLabel={selectedServiceLabel}
              providerLabel={selectedProviderLabel}
            />
          </motion.div>
        )}
      </div>

      {shouldShowContactSection && (
        <motion.div
          key="booking-actions"
          layout
          {...sectionAnimation}
          transition={{ ...sectionAnimation.transition, delay: prefersReducedMotion ? 0 : 0.25 }}
          className="flex flex-col items-end gap-2"
        >
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link href="/">
              <Button
                variant="secondary"
                size="md"
                disableAnimation={prefersReducedMotion}
              >
                بازگشت
              </Button>
            </Link>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isActionDisabled}
              onClick={handleContinue}
              disableAnimation={prefersReducedMotion}
              whileHover={prefersReducedMotion || isActionDisabled ? undefined : { y: -3 }}
              whileTap={prefersReducedMotion || isActionDisabled ? undefined : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              {isSubmitting ? 'در حال ثبت...' : 'ادامه'}
            </Button>
          </div>
          <div className="flex max-w-xl flex-col items-end gap-1 text-right" aria-live="polite">
            {isSubmitting && (
              <span className="text-xs text-muted-foreground">چند لحظه صبر کنید؛ در حال ثبت نوبت هستیم.</span>
            )}
            {submitError && <span className="text-sm text-destructive">{submitError}</span>}
            {validationErrors.length > 0 && (
              <ul className="list-disc space-y-1 pr-4 text-xs text-destructive">
                {validationErrors.map((message, index) => (
                  <li key={`${message}-${index}`}>{message}</li>
                ))}
              </ul>
            )}
            {bookingReference && !isSubmitting && (
              <span className="text-sm text-accent">
                نوبت با کد پیگیری {bookingReference} ثبت شد. در حال انتقال به صفحه تأیید...
              </span>
            )}
          </div>
        </motion.div>
      )}
    </GlassSurface>
  )
}

const BookingPage = () => (
  <GlobalLoadingOverlayProvider>
    <BookingPageContent />
  </GlobalLoadingOverlayProvider>
)

export default BookingPage
