'use client'

import SchedulePicker from '@/components/SchedulePicker'
import { type AvailabilityDay, type AvailabilitySlot } from '@/features/booking/types'

const cardClasses =
  'rounded-2xl sm:rounded-3xl border border-white/25 bg-white/45 p-4 sm:p-5 lg:p-6 shadow-[0_18px_40px_-28px_rgba(31,38,135,0.3)] backdrop-blur-sm dark:border-white/10 dark:bg-black/50'

type ScheduleSectionProps = {
  availability: AvailabilityDay[]
  selectedDay: string | null
  selectedSlotId: string | null
  onSelectDay: (day: AvailabilityDay) => void
  onSelectSlot: (slot: AvailabilitySlot, day: AvailabilityDay) => void
  placeholderMessage: string
  isLoading: boolean
  errorMessage?: string | null
  onRetry?: () => void
}

const ScheduleSection = ({
  availability,
  selectedDay,
  selectedSlotId,
  onSelectDay,
  onSelectSlot,
  placeholderMessage,
  isLoading,
  errorMessage,
  onRetry,
}: ScheduleSectionProps) => (
  <div className={cardClasses}>
    <div className="flex flex-col items-end gap-1 sm:gap-2 text-right">
      <h3 className="text-sm font-semibold text-foreground">انتخاب زمان ملاقات</h3>
      <p className="text-xs leading-6 text-muted-foreground">
        از میان زمان‌های خالی زیر نوبت مناسب را انتخاب کنید. زمان‌ها بر اساس پزشکان و خدمات فعال مرتب شده‌اند.
      </p>
    </div>
    <div className="mt-4 sm:mt-5 lg:mt-6">
      {errorMessage ? (
        <div className="flex flex-col items-end gap-3 rounded-2xl border border-dashed border-red-300/50 bg-white/40 p-6 text-right text-sm text-red-500 dark:border-red-300/30 dark:bg-white/10">
          <p>{errorMessage}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full border border-red-400/60 px-4 py-2 text-xs font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 dark:border-red-300/40 dark:text-red-200 dark:hover:bg-red-500/10"
            >
              تلاش دوباره
            </button>
          ) : null}
        </div>
      ) : (
        <SchedulePicker
          availability={availability}
          selectedDay={selectedDay}
          selectedSlotId={selectedSlotId}
          onSelectDay={onSelectDay}
          onSelectSlot={onSelectSlot}
          placeholderMessage={placeholderMessage}
          emptyMessage="در حال حاضر زمانی برای این روز در دسترس نیست. لطفاً روز دیگری را امتحان کنید."
          isLoading={isLoading}
        />
      )}
    </div>
  </div>
)

export default ScheduleSection
