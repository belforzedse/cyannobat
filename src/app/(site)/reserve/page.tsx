'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import clsx from 'clsx';
import ServiceCard from '@/components/ServiceCard';
import SchedulePicker from '@/components/SchedulePicker';
import {
  mockAvailability,
  type AvailabilityDay,
  type AvailabilitySlot,
  type DoctorId,
  type ServiceId,
} from '@/data/mockAvailability';

type ServiceOption = {
  value: ServiceId;
  label: string;
  description: string;
  icon: string;
  badge?: string;
};

type DoctorOption = {
  value: DoctorId;
  label: string;
  description: string;
  icon: string;
  badge?: string;
};

const serviceOptions: ServiceOption[] = [
  {
    value: 'general',
    label: 'مشاوره عمومی',
    description: 'پاسخ به پرسش‌های روزمره و دریافت راهنمایی دقیق از تیم متخصص.',
    icon: '💬',
    badge: 'پیشنهاد ما',
  },
  {
    value: 'cardio',
    label: 'ویزیت تخصص قلب',
    description: 'ارزیابی دقیق قلب و تدوین برنامه درمانی متناسب با شرایط شما.',
    icon: '❤️',
  },
  {
    value: 'checkup',
    label: 'چکاپ دوره‌ای',
    description: 'بررسی کامل وضعیت سلامتی و ارائه گزارش شخصی‌سازی شده.',
    icon: '🩺',
    badge: 'پرطرفدار',
  },
];

const doctorOptions: DoctorOption[] = [
  {
    value: 'nasrin',
    label: 'دکتر نسرین حاتمی',
    description: 'فوق تخصص قلب و عروق، مدرس دانشگاه علوم پزشکی تهران.',
    icon: '👩‍⚕️',
    badge: '۱۵ سال تجربه',
  },
  {
    value: 'omid',
    label: 'دکتر امید فرهی',
    description: 'متخصص داخلی با تمرکز بر سبک زندگی و پیشگیری.',
    icon: '👨‍⚕️',
    badge: 'محبوب بیماران',
  },
  {
    value: 'leila',
    label: 'دکتر لیلا محمدی',
    description: 'متخصص تغذیه و دیابت، همراه بیمار در مسیر درمان.',
    icon: '👩‍⚕️',
  },
];

const progressSteps = [
  { key: 'service', label: 'انتخاب خدمت' },
  { key: 'doctor', label: 'انتخاب پزشک' },
  { key: 'schedule', label: 'زمان‌بندی' },
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
  const [selectedService, setSelectedService] = useState<ServiceId | ''>('');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorId | ''>('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<SelectedSchedule | null>(null);

  const selectedServiceDetails = serviceOptions.find((service) => service.value === selectedService);
  const selectedDoctorDetails = doctorOptions.find((doctor) => doctor.value === selectedDoctor);
  const isScheduleComplete = Boolean(selectedSchedule);

  const availabilityForSelection = useMemo(() => {
    if (!selectedService || !selectedDoctor) {
      return undefined;
    }

    return mockAvailability[selectedService][selectedDoctor];
  }, [selectedDoctor, selectedService]);

  useEffect(() => {
    setSelectedDoctor('');
    setSelectedDay(null);
    setSelectedSchedule(null);
  }, [selectedService]);

  useEffect(() => {
    setSelectedDay(null);
    setSelectedSchedule(null);
  }, [selectedDoctor]);

  useEffect(() => {
    if (!availabilityForSelection || availabilityForSelection.length === 0) {
      setSelectedDay(null);
      setSelectedSchedule(null);
      return;
    }

    setSelectedDay((currentDay) => {
      if (!currentDay) return currentDay;
      const exists = availabilityForSelection.some((day) => day.date === currentDay);
      return exists ? currentDay : null;
    });

    setSelectedSchedule((currentSchedule) => {
      if (!currentSchedule) return currentSchedule;
      const dayMatch = availabilityForSelection.find((day) => day.date === currentSchedule.day.date);
      if (!dayMatch) {
        return null;
      }
      const slotMatch = dayMatch.slots.find((slot) => slot.id === currentSchedule.slot.id);
      return slotMatch ? currentSchedule : null;
    });
  }, [availabilityForSelection]);

  const handleServiceSelect = (service: ServiceId) => {
    setSelectedService(service);
  };

  const handleDoctorSelect = (doctor: DoctorId) => {
    setSelectedDoctor(doctor);
  };

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

  const activeIndex = progressSteps.findIndex((step) => {
    if (step.key === 'service') return !selectedServiceDetails;
    if (step.key === 'doctor') return !selectedDoctorDetails;
    return !isScheduleComplete;
  });

  const resolvedActiveIndex = activeIndex === -1 ? progressSteps.length - 1 : activeIndex;

  const stepsWithStatus = progressSteps.map((step, index) => {
    const complete =
      step.key === 'service'
        ? Boolean(selectedServiceDetails)
        : step.key === 'doctor'
          ? Boolean(selectedDoctorDetails)
          : isScheduleComplete;

    const status: StepStatus = complete ? 'complete' : index === resolvedActiveIndex ? 'current' : 'upcoming';

    return { ...step, status, index };
  });

  const formattedDate = selectedSchedule
    ? formatDateLabel(selectedSchedule.day.date)
    : formatDateLabel(selectedDay);
  const formattedTime = formatTimeRange(selectedSchedule?.slot ?? null);
  const isContinueDisabled = !selectedServiceDetails || !selectedDoctorDetails || !selectedSchedule;

  const placeholderMessage = !selectedServiceDetails
    ? 'ابتدا خدمت مورد نظر را انتخاب کنید تا زمان‌های خالی نمایش داده شود.'
    : !selectedDoctorDetails
      ? 'برای مشاهده زمان‌های موجود، پزشک را انتخاب کنید.'
      : undefined;

  return (
    <motion.section
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="glass relative flex flex-col gap-12 overflow-hidden px-8 py-12 text-right sm:px-12 lg:px-16"
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

      <header className="flex flex-col items-end gap-5">
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

      <form className="grid gap-8">
        <motion.div
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0 : 0.45 }}
          className="rounded-3xl border border-white/25 bg-white/45 p-6 shadow-[0_18px_40px_-28px_rgba(31,38,135,0.3)] backdrop-blur-sm dark:border-white/12 dark:bg-white/10"
        >
          <div className="flex flex-col items-end gap-2 text-right">
            <h3 className="text-sm font-semibold text-foreground">انتخاب خدمت</h3>
            <p className="text-xs leading-6 text-muted-foreground">
              نوع خدمتی که نیاز دارید را انتخاب کنید تا پیشنهادهای دقیق‌تری دریافت کنید.
            </p>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {serviceOptions.map((service, index) => (
              <motion.div
                key={service.value}
                initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: prefersReducedMotion ? 0 : 0.05 * index,
                  duration: prefersReducedMotion ? 0 : 0.4,
                  ease: 'easeOut',
                }}
              >
                <ServiceCard
                  title={service.label}
                  description={service.description}
                  badge={service.badge}
                  icon={service.icon}
                  isSelected={selectedService === service.value}
                  onClick={() => handleServiceSelect(service.value)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.45, duration: prefersReducedMotion ? 0 : 0.45 }}
          className="rounded-3xl border border-white/25 bg-white/45 p-6 shadow-[0_18px_40px_-28px_rgba(31,38,135,0.3)] backdrop-blur-sm dark:border-white/12 dark:bg-white/10"
        >
          <div className="flex flex-col items-end gap-2 text-right">
            <h3 className="text-sm font-semibold text-foreground">انتخاب پزشک</h3>
            <p className="text-xs leading-6 text-muted-foreground">پزشک مورد اعتماد خود را برای ادامه مسیر درمان برگزینید.</p>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {doctorOptions.map((doctor, index) => (
              <motion.div
                key={doctor.value}
                initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: prefersReducedMotion ? 0 : 0.05 * index,
                  duration: prefersReducedMotion ? 0 : 0.4,
                  ease: 'easeOut',
                }}
              >
                <ServiceCard
                  title={doctor.label}
                  description={doctor.description}
                  badge={doctor.badge}
                  icon={doctor.icon}
                  isSelected={selectedDoctor === doctor.value}
                  onClick={() => handleDoctorSelect(doctor.value)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.5, duration: prefersReducedMotion ? 0 : 0.45 }}
          className="rounded-3xl border border-white/25 bg-white/45 p-6 shadow-[0_18px_40px_-28px_rgba(31,38,135,0.3)] backdrop-blur-sm dark:border-white/12 dark:bg-white/10"
        >
          <div className="flex flex-col items-end gap-2 text-right">
            <h3 className="text-sm font-semibold text-foreground">تاریخ و زمان</h3>
            <p className="text-xs leading-6 text-muted-foreground">روز و ساعت دلخواه را انتخاب کنید تا یادآورها را دریافت نمایید.</p>
          </div>
          <div className="mt-6">
            <SchedulePicker
              availability={availabilityForSelection}
              selectedDay={selectedDay}
              selectedSlotId={selectedSchedule?.slot.id ?? null}
              onSelectDay={handleDaySelect}
              onSelectSlot={handleSlotSelect}
              placeholderMessage={placeholderMessage}
              emptyMessage="در حال حاضر زمانی برای این ترکیب موجود نیست. لطفاً بعداً دوباره بررسی کنید."
            />
          </div>
        </motion.div>
      </form>

      <motion.div
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.55, duration: prefersReducedMotion ? 0 : 0.45 }}
        className="rounded-3xl border border-white/20 bg-white/35 p-6 shadow-[0_16px_42px_-30px_rgba(31,38,135,0.25)] backdrop-blur-sm dark:border-white/12 dark:bg-white/10"
      >
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
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex flex-col items-end gap-1">
            <dt className="text-xs font-medium text-muted-foreground">خدمت انتخابی</dt>
            <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground dark:border-white/12 dark:bg-white/10">
              {selectedServiceDetails?.label ?? 'انتخاب نشده'}
            </dd>
          </div>
          <div className="flex flex-col items-end gap-1">
            <dt className="text-xs font-medium text-muted-foreground">پزشک منتخب</dt>
            <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground dark:border-white/12 dark:bg-white/10">
              {selectedDoctorDetails
                ? `${selectedDoctorDetails.label}${selectedDoctorDetails.badge ? ' — ' + selectedDoctorDetails.badge : ''}`
                : 'انتخاب نشده'}
            </dd>
          </div>
          <div className="flex flex-col items-end gap-1">
            <dt className="text-xs font-medium text-muted-foreground">تاریخ</dt>
            <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground dark:border-white/12 dark:bg-white/10">
              {formattedDate}
            </dd>
          </div>
          <div className="flex flex-col items-end gap-1">
            <dt className="text-xs font-medium text-muted-foreground">ساعت</dt>
            <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground dark:border-white/12 dark:bg-white/10">
              {formattedTime}
            </dd>
          </div>
        </dl>
      </motion.div>

      <motion.div
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.6, duration: prefersReducedMotion ? 0 : 0.4 }}
        className="flex flex-wrap items-center justify-end gap-3"
      >
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
      </motion.div>
    </motion.section>
  );
};

export default BookingPage;
