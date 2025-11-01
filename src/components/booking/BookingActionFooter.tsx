'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/Button'

export type BookingActionFooterProps = {
  prefersReducedMotion: boolean
  isActionDisabled: boolean
  isSubmitting: boolean
  submitError: string | null
  validationErrors: string[]
  bookingReference: string | null
  onContinue: () => void
}

const BookingActionFooter = ({
  prefersReducedMotion,
  isActionDisabled,
  isSubmitting,
  submitError,
  validationErrors,
  bookingReference,
  onContinue,
}: BookingActionFooterProps) => {
  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link href="/">
          <Button variant="secondary" size="md" disableAnimation={prefersReducedMotion}>
            بازگشت
          </Button>
        </Link>
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={isActionDisabled}
          onClick={onContinue}
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
    </>
  )
}

export default BookingActionFooter
