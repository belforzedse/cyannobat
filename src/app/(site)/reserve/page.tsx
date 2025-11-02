'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { GlassSurface } from '@/components/ui/glass';

import BookingActionFooter from '@/components/booking/BookingActionFooter';
import BookingStepper from '@/components/booking/BookingStepper';
import BookingSummaryPanel from '@/components/booking/BookingSummaryPanel';
import ScheduleSection from '@/components/booking/ScheduleSection';
import ReasonsSection from '@/components/booking/ReasonsSection';
import ContactSection from '@/components/booking/ContactSection';
import ServiceSection from '@/components/booking/ServiceSection';
import { reasonOptions } from '@/lib/booking/constants';
import { useBookingState } from '@/hooks/booking/useBookingState';
import { useBookingSubmission } from '@/hooks/booking/useBookingSubmission';
import {
  GlobalLoadingOverlayProvider,
  useGlobalLoadingOverlay,
} from '@/components/GlobalLoadingOverlayProvider';
import { useToast } from '@/components/ui';

const BookingPageContent = () => {
  const reducedMotionSetting = useReducedMotion();
  const prefersReducedMotion = reducedMotionSetting ?? false;
  const router = useRouter();
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
  } = useBookingState();
  const { setActivity } = useGlobalLoadingOverlay();
  const { showToast } = useToast();

  const scheduleSectionRef = useRef<HTMLDivElement | null>(null);
  const reasonSectionRef = useRef<HTMLDivElement | null>(null);
  const contactSectionRef = useRef<HTMLDivElement | null>(null);
  const sectionAnimation = {
    initial: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : -12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' },
  };

  const shouldShowScheduleSection = isServiceComplete;
  const shouldShowReasonSection = isScheduleComplete;
  const shouldShowContactSection = isReasonComplete;
  const shouldShowSummarySection =
    isServiceComplete && isScheduleComplete && isReasonComplete && isCustomerComplete;

  useEffect(() => {
    setActivity('booking-availability', availabilityLoading, 'در حال بررسی زمان‌های خالی...');
    return () => {
      setActivity('booking-availability', false);
    };
  }, [availabilityLoading, setActivity]);

  const scrollToSection = useCallback(
    (sectionRef: { current: HTMLElement | null }) => {
      const element = sectionRef.current;
      if (!element) return;

      element.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    },
    [prefersReducedMotion],
  );

  const hasShownScheduleSectionRef = useRef(shouldShowScheduleSection);
  const hasShownReasonSectionRef = useRef(shouldShowReasonSection);
  const hasShownContactSectionRef = useRef(shouldShowContactSection);

  useEffect(() => {
    if (shouldShowScheduleSection && !hasShownScheduleSectionRef.current) {
      scrollToSection(scheduleSectionRef);
    }

    hasShownScheduleSectionRef.current = shouldShowScheduleSection;
  }, [shouldShowScheduleSection, scrollToSection]);

  useEffect(() => {
    if (shouldShowReasonSection && !hasShownReasonSectionRef.current) {
      scrollToSection(reasonSectionRef);
    }

    hasShownReasonSectionRef.current = shouldShowReasonSection;
  }, [shouldShowReasonSection, scrollToSection]);

  useEffect(() => {
    if (shouldShowContactSection && !hasShownContactSectionRef.current) {
      scrollToSection(contactSectionRef);
    }

    hasShownContactSectionRef.current = shouldShowContactSection;
  }, [shouldShowContactSection, scrollToSection]);

  const {
    isSubmitting,
    submitError,
    validationErrors,
    bookingReference,
    isActionDisabled,
    handleContinue,
  } = useBookingSubmission({
    additionalReason,
    customerInfo,
    customerNotes,
    reasonSummary,
    router,
    selectedReasons,
    selectedSchedule,
    setActivity,
    showToast,
    isContinueDisabled,
  });

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
          transition={{
            delay: prefersReducedMotion ? 0 : 0.1,
            duration: prefersReducedMotion ? 0 : 0.45,
          }}
          className="rounded-full border border-white/25 bg-white/20 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm dark:border-white/15 dark:bg-white/10"
        >
          مسیر رزرو نوبت
        </motion.span>
        <motion.h1
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: prefersReducedMotion ? 0 : 0.2,
            duration: prefersReducedMotion ? 0 : 0.5,
          }}
          className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
        >
          رزرو سریع وقت ملاقات
        </motion.h1>
        <motion.p
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: prefersReducedMotion ? 0 : 0.3,
            duration: prefersReducedMotion ? 0 : 0.5,
          }}
          className="max-w-2xl text-balance leading-relaxed text-muted-foreground"
        >
          از میان خدمات فعال، بازه زمانی مناسب خود را انتخاب کنید؛ ارائه‌دهنده مرتبط همراه هر بازه
          معرفی شده است. سپس علت مراجعه را بنویسید و اطلاعات تماس را ثبت نمایید. در پایان جزئیات را
          یک بار دیگر مرور کنید تا نوبت شما به‌صورت خودکار در سامانه ثبت شود.
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
          <motion.div
            layout
            {...sectionAnimation}
            transition={{ ...sectionAnimation.transition, delay: 0 }}
          >
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
              transition={{
                ...sectionAnimation.transition,
                delay: prefersReducedMotion ? 0 : 0.05,
              }}
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
              transition={{
                ...sectionAnimation.transition,
                delay: prefersReducedMotion ? 0 : 0.15,
              }}
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
            <BookingSummaryPanel
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
          <BookingActionFooter
            prefersReducedMotion={prefersReducedMotion}
            isActionDisabled={isActionDisabled}
            isSubmitting={isSubmitting}
            submitError={submitError}
            validationErrors={validationErrors}
            bookingReference={bookingReference}
            onContinue={handleContinue}
          />
        </motion.div>
      )}
    </GlassSurface>
  );
};

const BookingPage = () => (
  <GlobalLoadingOverlayProvider>
    <BookingPageContent />
  </GlobalLoadingOverlayProvider>
);

export default BookingPage;
