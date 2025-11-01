'use client'

import { motion, useReducedMotion } from 'framer-motion'

import SchedulePicker from '@/components/SchedulePicker'
import { Card } from '@/components/ui'
import { type AvailabilityDay, type AvailabilitySlot } from '@/lib/booking/types'
import { luxuryPresets } from '@/lib/luxuryAnimations'

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

const formatSelectedSummary = (day: AvailabilityDay | null, slot: AvailabilitySlot | null): string | null => {
  if (!day || !slot) return null

  try {
    const dateLabel = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full' }).format(new Date(`${day.date}T12:00:00Z`))
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: slot.timeZone ?? 'UTC',
    })
    const startLabel = formatter.format(new Date(slot.start))
    const endLabel = formatter.format(new Date(slot.end))

    return `${dateLabel} · ${startLabel} تا ${endLabel} — ارائه‌دهنده: ${slot.providerName}`
  } catch {
    return `${day.date} · ${slot.start} تا ${slot.end} — ارائه‌دهنده: ${slot.providerName}`
  }
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
}: ScheduleSectionProps) => {
  const prefersReducedMotion = useReducedMotion()
  const reduceMotion = Boolean(prefersReducedMotion)
  const sectionVariants = reduceMotion ? undefined : luxuryPresets.silk('up')
  const motionStates = reduceMotion ? {} : { initial: 'initial' as const, animate: 'animate' as const }

  const activeDay =
    (selectedDay ? availability.find((day) => day.date === selectedDay) : null) ??
    availability.find((day) => day.slots.some((slot) => slot.id === selectedSlotId)) ??
    null
  const activeSlot = activeDay?.slots.find((slot) => slot.id === selectedSlotId) ?? null
  const selectionSummary = formatSelectedSummary(activeDay, activeSlot)

  return (
    <motion.section variants={sectionVariants} {...motionStates}>
      <Card variant="default" padding="lg" className="sm:rounded-3xl">
      <div className="flex flex-col items-end gap-1 sm:gap-2 text-right">
        <h3 className="text-sm font-semibold text-foreground">انتخاب تاریخ و زمان خدمت</h3>
        <p className="text-xs leading-6 text-muted-foreground">
          ابتدا روز مناسب را انتخاب کنید و سپس از میان زمان‌های خالی آن روز، ساعت دقیق نوبت را مشخص کنید. همراه هر بازه،
          ارائه‌دهنده هماهنگ‌شده همان خدمت نمایش داده می‌شود.
        </p>
        {selectionSummary ? (
          <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent">
            {selectionSummary}
          </span>
        ) : null}
      </div>
      <div className="mt-4 sm:mt-5 lg:mt-6">
        {errorMessage ? (
          <div className="flex flex-col items-end gap-3 rounded-2xl border border-dashed border-red-300/50 bg-white/40 p-6 text-right text-sm text-red-500 dark:border-red-300/30 dark:bg-white/10">
            <p>{errorMessage}</p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full border border-red-400/60 px-4 py-2 text-xs font-semibold text-red-600 transition-all duration-300 ease-out hover:bg-red-50 dark:border-red-300/40 dark:text-red-200 dark:hover:bg-red-500/10"
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
            emptyMessage="برای این روز زمانی ثبت نشده است. لطفاً روز دیگری را امتحان کنید یا با پذیرش تماس بگیرید."
            isLoading={isLoading}
          />
        )}
      </div>
      </Card>
    </motion.section>
  )
}

export default ScheduleSection

