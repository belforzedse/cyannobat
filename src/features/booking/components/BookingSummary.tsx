'use client';

import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { type CustomerInfo } from '../types';

type BookingSummaryProps = {
  prefersReducedMotion: boolean;
  isContinueDisabled: boolean;
  formattedDate: string;
  formattedTime: string;
  reasonSummary: string[];
  customerInfo: CustomerInfo;
  customerNotes: string;
  isCustomerComplete: boolean;
};

const BookingSummary = ({
  prefersReducedMotion,
  isContinueDisabled,
  formattedDate,
  formattedTime,
  reasonSummary,
  customerInfo,
  customerNotes,
  isCustomerComplete,
}: BookingSummaryProps) => (
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
            isContinueDisabled ? 'border border-white/20 text-muted-foreground' : 'border border-accent/50 bg-accent/15 text-accent',
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
);

export default BookingSummary;
