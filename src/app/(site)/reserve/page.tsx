'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import BookingStepper from '@/features/booking/components/BookingStepper';
import ScheduleSection from '@/features/booking/components/ScheduleSection';
import ReasonsSection from '@/features/booking/components/ReasonsSection';
import ContactSection from '@/features/booking/components/ContactSection';
import BookingSummary from '@/features/booking/components/BookingSummary';
import { reasonOptions } from '@/features/booking/constants';
import { useBookingState } from '@/features/booking/hooks/useBookingState';

const BookingPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const {
    availabilityForSelection,
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
    isContinueDisabled,
    isCustomerComplete,
    reasonSummary,
    schedulePlaceholderMessage,
  } = useBookingState();

  return (
    <motion.section
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="glass relative flex flex-col gap-6 overflow-hidden px-4 py-6 text-right sm:gap-12 sm:px-12 sm:py-12 lg:px-16"
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
          آغاز رزرو آنلاین
        </motion.span>
        <motion.h1
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
          className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
        >
          رزرو نوبت
        </motion.h1>
        <motion.p
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
          className="max-w-2xl text-balance leading-relaxed text-muted-foreground"
        >
          لطفاً اطلاعات مورد نیاز را تکمیل کنید تا گام‌های بعدی برای هماهنگی نوبت در اختیار شما قرار گیرد. می‌توانید در هر لحظه
          انتخاب‌های خود را ویرایش کنید.
        </motion.p>
      </header>

      <BookingStepper steps={stepsWithStatus} prefersReducedMotion={prefersReducedMotion} />

      <form className="grid gap-4 sm:gap-6 lg:gap-8">
        <ScheduleSection
          availability={availabilityForSelection}
          selectedDay={selectedDay}
          selectedSlotId={selectedSchedule?.slot.id ?? null}
          onSelectDay={handleDaySelect}
          onSelectSlot={handleSlotSelect}
          placeholderMessage={schedulePlaceholderMessage}
        />

        <ReasonsSection
          options={reasonOptions}
          selectedReasons={selectedReasons}
          onToggleReason={handleReasonToggle}
          additionalReason={additionalReason}
          onAdditionalReasonChange={(value) => setAdditionalReason(value)}
        />

        <ContactSection
          customerInfo={customerInfo}
          onCustomerChange={handleCustomerChange}
          customerNotes={customerNotes}
          onCustomerNotesChange={(value) => setCustomerNotes(value)}
        />
      </form>

      <BookingSummary
        prefersReducedMotion={prefersReducedMotion}
        isContinueDisabled={isContinueDisabled}
        formattedDate={formattedDate}
        formattedTime={formattedTime}
        reasonSummary={reasonSummary}
        customerInfo={customerInfo}
        customerNotes={customerNotes}
        isCustomerComplete={isCustomerComplete}
      />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link href="/" className="btn-secondary">
          بازگشت
        </Link>
        <motion.button
          type="button"
          className="btn-primary"
          disabled={isContinueDisabled}
          whileHover={prefersReducedMotion || isContinueDisabled ? undefined : { y: -3 }}
          whileTap={prefersReducedMotion || isContinueDisabled ? undefined : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          ادامه
        </motion.button>
      </div>
    </motion.section>
  );
};

export default BookingPage;
