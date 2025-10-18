'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import clsx from 'clsx';
import SchedulePicker from '@/components/SchedulePicker';
import BookingInput from '@/components/BookingInput';
import { mockAvailability, type AvailabilityDay, type AvailabilitySlot } from '@/data/mockAvailability';

const progressSteps = [
  { key: 'dateTime', label: 'انتخاب تاریخ و زمان' },
  { key: 'reason', label: 'دلیل مراجعه' },
  { key: 'customer', label: 'اطلاعات تماس' },
] as const;

const reasonOptions = [
  { value: 'follow_up', label: 'پیگیری روند درمان' },
  { value: 'new_symptom', label: 'بروز علائم جدید' },
  { value: 'checkup', label: 'چکاپ و پیشگیری' },
  { value: 'second_opinion', label: 'دریافت نظر دوم' },
] as const;

type StepStatus = 'complete' | 'current' | 'upcoming';

const formatDateLabel = (value: string | null) => {
  if (!value) {
    return 'انتخاب نشده';
  }

  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`));
  } catch {
    return value;
  }
};

const formatTimeRange = (slot: AvailabilitySlot | null) => {
  if (!slot) {
    return 'انتخاب نشده';
  }

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map((part) => Number.parseInt(part, 10));
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return time;
    }

    try {
      return new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC',
      }).format(new Date(Date.UTC(2024, 0, 1, hour, minute)));
    } catch {
      return time;
    }
  };

  return `${formatTime(slot.start)} تا ${formatTime(slot.end)}`;
};

type SelectedSchedule = {
  day: AvailabilityDay;
  slot: AvailabilitySlot;
};

const BookingPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<SelectedSchedule | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [additionalReason, setAdditionalReason] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [customerNotes, setCustomerNotes] = useState('');

  const availabilityForSelection = useMemo(() => {
    const merged = new Map<string, AvailabilityDay>();

    Object.values(mockAvailability).forEach((serviceAvailability) => {
      Object.values(serviceAvailability).forEach((doctorAvailability) => {
        doctorAvailability.forEach((day) => {
          const existingDay = merged.get(day.date);
          if (!existingDay) {
            merged.set(day.date, {
              date: day.date,
              slots: [...day.slots],
              note: day.note,
            });
            return;
          }

          const combinedSlots = [...existingDay.slots];
          day.slots.forEach((slot) => {
            if (!combinedSlots.some((existingSlot) => existingSlot.id === slot.id)) {
              combinedSlots.push(slot);
            }
          });

          merged.set(day.date, {
            date: day.date,
            slots: combinedSlots.sort((a, b) => a.start.localeCompare(b.start)),
            note: existingDay.note ?? day.note,
          });
        });
      });
    });

    return Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const handleDaySelect = (day: AvailabilityDay) => {
    setSelectedDay(day.date);
    setSelectedSchedule((currentSchedule) => {
      if (currentSchedule && currentSchedule.day.date === day.date) {
        return currentSchedule;
      }
      return null;
    });
  };

  const handleSlotSelect = (slot: AvailabilitySlot, day: AvailabilityDay) => {
    setSelectedDay(day.date);
    setSelectedSchedule({ day, slot });
  };

  const handleReasonToggle = (value: string) => {
    setSelectedReasons((prev) => {
      if (prev.includes(value)) {
        return prev.filter((reason) => reason !== value);
      }
      return [...prev, value];
    });
  };

  const handleCustomerChange = (field: keyof typeof customerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const selectedReasonLabels = selectedReasons
    .map((reason) => reasonOptions.find((option) => option.value === reason)?.label ?? reason)
    .filter((label): label is string => Boolean(label));

  const isScheduleComplete = Boolean(selectedSchedule);
  const isReasonComplete = selectedReasons.length > 0 || additionalReason.trim().length > 0;
  const isCustomerComplete = Object.values(customerInfo).every((value) => value.trim().length > 0);

  const activeIndex = progressSteps.findIndex((step) => {
    if (step.key === 'dateTime') return !isScheduleComplete;
    if (step.key === 'reason') return !isReasonComplete;
    return !isCustomerComplete;
  });

  const resolvedActiveIndex = activeIndex === -1 ? progressSteps.length - 1 : activeIndex;

  const stepsWithStatus = progressSteps.map((step, index) => {
    const complete =
      step.key === 'dateTime'
        ? isScheduleComplete
        : step.key === 'reason'
          ? isReasonComplete
          : isCustomerComplete;

    const status: StepStatus = complete ? 'complete' : index === resolvedActiveIndex ? 'current' : 'upcoming';

    return { ...step, status, index };
  });

  const formattedDate = selectedSchedule
    ? formatDateLabel(selectedSchedule.day.date)
    : formatDateLabel(selectedDay);
  const formattedTime = formatTimeRange(selectedSchedule?.slot ?? null);
  const isContinueDisabled = !isScheduleComplete || !isReasonComplete || !isCustomerComplete;

  const reasonSummary = isReasonComplete
    ? [
        ...selectedReasonLabels,
        additionalReason.trim() ? `توضیحات: ${additionalReason.trim()}` : null,
      ].filter((value): value is string => Boolean(value))
    : [];

  const placeholderMessage = 'برای مشاهده زمان‌های خالی، ابتدا تاریخ مورد نظر را انتخاب کنید.';

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

      <motion.ul
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.35, duration: prefersReducedMotion ? 0 : 0.5 }}
        className="grid gap-3 text-sm sm:grid-cols-3"
      >
        {stepsWithStatus.map((step) => (
          <motion.li
            key={step.key}
            className={clsx(
              'relative flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-right shadow-sm backdrop-blur-sm transition-all duration-300',
              step.status === 'complete' &&
                'border-accent/60 bg-accent/15 text-foreground shadow-[0_14px_32px_-20px_rgba(88,175,192,0.6)] dark:border-accent/50 dark:bg-accent/12',
              step.status === 'current' &&
                'border-white/30 bg-white/45 text-foreground shadow-[0_12px_28px_-20px_rgba(31,38,135,0.25)] dark:border-white/18 dark:bg-white/15',
              step.status === 'upcoming' &&
                'border-white/20 bg-white/25 text-muted-foreground dark:border-white/12 dark:bg-white/8 dark:text-muted-foreground',
            )}
            aria-current={step.status === 'current' ? 'step' : undefined}
          >
            <div className="flex flex-row-reverse items-center gap-3">
              <span
                className={clsx(
                  'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]',
                  step.status === 'complete' && 'bg-gradient-to-br from-accent to-accent/80 text-slate-900',
                  step.status === 'current' && 'bg-gradient-to-br from-white/85 to-white/65 text-foreground',
                  step.status === 'upcoming' && 'bg-white/40 text-muted-foreground dark:bg-white/10',
                )}
              >
                ۰{step.index + 1}
              </span>
              <span className="text-sm font-semibold">{step.label}</span>
            </div>
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={step.status}
                initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : -6 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
                className={clsx(
                  'flex flex-row-reverse items-center gap-1 text-[11px] font-medium',
                  step.status === 'complete' ? 'text-accent' : 'text-muted-foreground',
                )}
              >
                {step.status === 'complete' ? (
                  <>
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-7.657 7.657a1 1 0 01-1.414 0L5.293 11.02a1 1 0 011.414-1.414l1.929 1.93 6.95-6.95a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>تکمیل شد</span>
                  </>
                ) : step.status === 'current' ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-accent/70" aria-hidden />
                    <span>در حال انجام</span>
                  </>
                ) : (
                  <span>در انتظار</span>
                )}
              </motion.span>
            </AnimatePresence>
          </motion.li>
        ))}
      </motion.ul>

      <form className="grid gap-4 sm:gap-6 lg:gap-8">
        <div className="rounded-2xl sm:rounded-3xl border border-white/25 bg-white/45 p-4 sm:p-5 lg:p-6 shadow-[0_18px_40px_-28px_rgba(31,38,135,0.3)] backdrop-blur-sm dark:border-white/10 dark:bg-black/50">
          <div className="flex flex-col items-end gap-1 sm:gap-2 text-right">
            <h3 className="text-sm font-semibold text-foreground">تاریخ و زمان</h3>
            <p className="text-xs leading-6 text-muted-foreground">روز و ساعت دلخواه را انتخاب کنید تا یادآورها را دریافت نمایید.</p>
          </div>
          <div className="mt-4 sm:mt-5 lg:mt-6">
            <SchedulePicker
              availability={availabilityForSelection}
              selectedDay={selectedDay}
              selectedSlotId={selectedSchedule?.slot.id ?? null}
              onSelectDay={handleDaySelect}
              onSelectSlot={handleSlotSelect}
              placeholderMessage={placeholderMessage}
              emptyMessage="در حال حاضر زمانی در دسترس نیست. لطفاً بعداً دوباره بررسی کنید."
            />
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-white/25 bg-white/45 p-4 sm:p-5 lg:p-6 shadow-[0_18px_40px_-28px_rgba(31,38,135,0.3)] backdrop-blur-sm dark:border-white/10 dark:bg-black/50">
          <div className="flex flex-col items-end gap-1 sm:gap-2 text-right">
            <h3 className="text-sm font-semibold text-foreground">دلیل مراجعه</h3>
            <p className="text-xs leading-6 text-muted-foreground">
              یکی از گزینه‌های زیر را انتخاب کنید یا توضیح کوتاهی درباره‌ی نیاز خود بنویسید.
            </p>
          </div>
          <div className="mt-3 sm:mt-4 lg:mt-5 grid gap-2 sm:gap-3 sm:grid-cols-2">
            {reasonOptions.map((reason) => {
              const isSelected = selectedReasons.includes(reason.value);
              return (
                <button
                  type="button"
                  key={reason.value}
                  onClick={() => handleReasonToggle(reason.value)}
                  className={clsx(
                    'flex w-full flex-row-reverse items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-right shadow-sm transition-all duration-200',
                    'hover:border-accent/60 hover:bg-accent/10 dark:hover:border-accent/50 dark:hover:bg-accent/10',
                    isSelected
                      ? 'border-accent/70 bg-accent/20 text-foreground shadow-[0_12px_28px_-22px_rgba(88,175,192,0.75)] dark:border-accent/60'
                      : 'border-white/25 bg-white/45 text-muted-foreground dark:border-white/15 dark:bg-black/40',
                  )}
                >
                  <span className="text-sm font-medium">{reason.label}</span>
                  <span
                    className={clsx(
                      'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                      isSelected
                        ? 'border-accent/70 bg-accent text-slate-900'
                        : 'border-white/30 bg-white/40 text-muted-foreground dark:border-white/20 dark:bg-black/30',
                    )}
                    aria-hidden
                  >
                    {isSelected ? '✓' : '۰'}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 sm:mt-5 lg:mt-6 flex flex-col gap-2">
            <label htmlFor="additional-reason" className="text-sm font-medium text-foreground text-right">
              توضیحات تکمیلی
            </label>
            <textarea
              id="additional-reason"
              value={additionalReason}
              onChange={(event) => setAdditionalReason(event.target.value)}
              className="min-h-[120px] w-full rounded-xl border border-white/20 bg-white/50 px-4 py-3 text-right text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 hover:border-white/30 hover:bg-white/60 focus:border-accent focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/12 dark:bg-white/10 dark:hover:border-white/20 dark:hover:bg-white/15 dark:focus:border-accent/50 dark:focus:bg-white/20"
              placeholder="در صورت نیاز جزئیات بیشتری را بنویسید"
            />
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-white/25 bg-white/45 p-4 sm:p-5 lg:p-6 shadow-[0_18px_40px_-28px_rgba(31,38,135,0.3)] backdrop-blur-sm dark:border-white/10 dark:bg-black/50">
          <div className="flex flex-col items-end gap-1 sm:gap-2 text-right">
            <h3 className="text-sm font-semibold text-foreground">اطلاعات تماس</h3>
            <p className="text-xs leading-6 text-muted-foreground">
              لطفاً راه‌های ارتباطی خود را وارد کنید تا هماهنگی‌ها سریع‌تر انجام شود.
            </p>
          </div>
          <div className="mt-3 sm:mt-4 lg:mt-5 grid gap-3 sm:gap-4 sm:grid-cols-3">
            <BookingInput
              label="نام و نام خانوادگی"
              name="fullName"
              value={customerInfo.fullName}
              onChange={(event) => handleCustomerChange('fullName', event.target.value)}
              placeholder="مثلاً سارا محمدی"
            />
            <BookingInput
              label="ایمیل"
              type="email"
              name="email"
              value={customerInfo.email}
              onChange={(event) => handleCustomerChange('email', event.target.value)}
              placeholder="you@example.com"
            />
            <BookingInput
              label="شماره تماس"
              type="tel"
              name="phone"
              value={customerInfo.phone}
              onChange={(event) => handleCustomerChange('phone', event.target.value)}
              placeholder="0912 xxx xxxx"
            />
          </div>
          <div className="mt-4 sm:mt-5">
            <label htmlFor="customer-notes" className="text-sm font-medium text-foreground text-right">
              یادداشت برای تیم پشتیبانی
            </label>
            <textarea
              id="customer-notes"
              value={customerNotes}
              onChange={(event) => setCustomerNotes(event.target.value)}
              className="mt-2 min-h-[100px] w-full rounded-xl border border-white/20 bg-white/50 px-4 py-3 text-right text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 hover:border-white/30 hover:bg-white/60 focus:border-accent focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/12 dark:bg-white/10 dark:hover:border-white/20 dark:hover:bg-white/15 dark:focus:border-accent/50 dark:focus:bg-white/20"
              placeholder="اگر نکته‌ای لازم است پیش از نوبت بدانیم اینجا بنویسید"
            />
          </div>
        </div>
      </form>

      <div className="rounded-2xl sm:rounded-3xl border border-white/20 bg-white/35 p-4 sm:p-5 lg:p-6 shadow-[0_16px_42px_-30px_rgba(31,38,135,0.25)] backdrop-blur-sm dark:border-white/10 dark:bg-black/40">
        <div className="flex flex-col items-end gap-3 text-right sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-semibold text-foreground">خلاصه انتخاب شما</span>
            <span className="text-xs text-muted-foreground">در صورت نیاز می‌توانید هر بخش را دوباره ویرایش کنید.</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={isContinueDisabled ? 'draft' : 'ready'}
              initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : -6 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
                isContinueDisabled
                  ? 'border border-white/20 text-muted-foreground'
                  : 'border border-accent/50 bg-accent/15 text-accent',
              )}
            >
              {isContinueDisabled ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-muted/60" aria-hidden />
                  <span>برای ادامه همه موارد را تکمیل کنید</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
                  <span>همه مراحل آماده ثبت هستند</span>
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </div>
        <dl className="mt-4 sm:mt-5 lg:mt-6 grid gap-2 sm:gap-3 text-sm sm:grid-cols-2">
          <div className="flex flex-col items-end gap-1">
            <dt className="text-xs font-medium text-muted-foreground">تاریخ</dt>
            <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/40">
              {formattedDate}
            </dd>
          </div>
          <div className="flex flex-col items-end gap-1">
            <dt className="text-xs font-medium text-muted-foreground">ساعت</dt>
            <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/40">
              {formattedTime}
            </dd>
          </div>
          <div className="flex flex-col items-end gap-1">
            <dt className="text-xs font-medium text-muted-foreground">دلیل مراجعه</dt>
            <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/40">
              {reasonSummary.length > 0 ? reasonSummary.join('، ') : 'انتخاب نشده'}
            </dd>
          </div>
          <div className="flex flex-col items-end gap-1">
            <dt className="text-xs font-medium text-muted-foreground">اطلاعات تماس</dt>
            <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/40">
              {isCustomerComplete
                ? `${customerInfo.fullName} — ${customerInfo.email} — ${customerInfo.phone}`
                : 'تکمیل نشده'}
            </dd>
          </div>
          <div className="flex flex-col items-end gap-1 sm:col-span-2">
            <dt className="text-xs font-medium text-muted-foreground">یادداشت</dt>
            <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/40">
              {customerNotes.trim() ? customerNotes.trim() : 'بدون یادداشت'}
            </dd>
          </div>
        </dl>
      </div>

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
