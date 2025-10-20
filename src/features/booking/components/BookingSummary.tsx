'use client'

import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'

import { Card } from '@/components/ui'
import { type CustomerInfo } from '@/features/booking/types'

type BookingSummaryProps = {
  prefersReducedMotion: boolean | null
  isContinueDisabled: boolean
  formattedDate: string
  formattedTime: string
  reasonSummary: string[]
  customerInfo: CustomerInfo
  customerNotes: string
  isCustomerComplete: boolean
  serviceLabel: string
  providerLabel: string
}

const BookingSummary = ({
  prefersReducedMotion,
  isContinueDisabled,
  formattedDate,
  formattedTime,
  reasonSummary,
  customerInfo,
  customerNotes,
  isCustomerComplete,
  serviceLabel,
  providerLabel,
}: BookingSummaryProps) => (
  <Card variant="subtle" padding="lg" className="sm:rounded-3xl">
    <div className="flex flex-col items-end gap-3 text-right sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-semibold text-foreground">خلاصه نهایی نوبت</span>
        <span className="text-xs text-muted-foreground">
          قبل از ثبت قطعی، جزئیات انتخاب‌شده را بررسی کنید و در صورت نیاز تغییر دهید.
        </span>
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
              <span>برای ادامه، همه مراحل را کامل کنید.</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
              <span>همه چیز آماده ثبت است.</span>
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </div>
    <dl className="mt-4 grid gap-2 text-sm sm:mt-5 sm:grid-cols-2 sm:gap-3 lg:mt-6">
      <div className="flex flex-col items-end gap-1">
        <dt className="text-xs font-medium text-muted-foreground">تاریخ نوبت</dt>
        <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/40">
          {formattedDate}
        </dd>
      </div>
      <div className="flex flex-col items-end gap-1">
        <dt className="text-xs font-medium text-muted-foreground">زمان انتخابی</dt>
        <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/40">
          {formattedTime}
        </dd>
      </div>
      <div className="flex flex-col items-end gap-1">
        <dt className="text-xs font-medium text-muted-foreground">خدمت انتخابی</dt>
        <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/40">
          {serviceLabel || 'انتخاب نشده'}
        </dd>
      </div>
      <div className="flex flex-col items-end gap-1">
        <dt className="text-xs font-medium text-muted-foreground">ارائه‌دهنده هماهنگ‌شده</dt>
        <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/40">
          {providerLabel || 'انتخاب نشده'}
        </dd>
      </div>
      <div className="flex flex-col items-end gap-1">
        <dt className="text-xs font-medium text-muted-foreground">علت مراجعه</dt>
        <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/40">
          {reasonSummary.length > 0 ? reasonSummary.join('، ') : 'انتخاب نشده'}
        </dd>
      </div>
      <div className="flex flex-col items-end gap-1">
        <dt className="text-xs font-medium text-muted-foreground">مشخصات تماس</dt>
        <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/40">
          {isCustomerComplete
            ? `${customerInfo.fullName} — ${customerInfo.email} — ${customerInfo.phone}`
            : 'کامل نشده'}
        </dd>
      </div>
      <div className="flex flex-col items-end gap-1 sm:col-span-2">
        <dt className="text-xs font-medium text-muted-foreground">توضیحات تکمیلی</dt>
        <dd className="w-full rounded-2xl border border-white/20 bg-white/45 px-4 py-2 text-sm text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/40">
          {customerNotes.trim() ? customerNotes.trim() : 'توضیحی ثبت نشده است.'}
        </dd>
      </div>
    </dl>
  </Card>
)

export default BookingSummary
