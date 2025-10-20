'use client'

import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import clsx from 'clsx'

import type { AvailabilityDay, AvailabilitySlot } from '@/features/booking/types'

type SchedulePickerProps = {
  availability?: AvailabilityDay[]
  selectedDay?: string | null
  selectedSlotId?: string | null
  onSelectDay?: (day: AvailabilityDay) => void
  onSelectSlot?: (slot: AvailabilitySlot, day: AvailabilityDay) => void
  isLoading?: boolean
  placeholderMessage?: string
  emptyMessage?: string
}

const formatDayHeading = (date: string) => {
  try {
    const dateInstance = new Date(`${date}T12:00:00Z`)
    const weekday = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(dateInstance)
    const label = new Intl.DateTimeFormat('fa-IR', {
      month: 'long',
      day: 'numeric',
    }).format(dateInstance)
    return { weekday, label }
  } catch {
    return { weekday: '', label: date }
  }
}

const formatTime = (isoDate: string, timeZone: string) => {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timeZone || 'UTC',
    }).format(new Date(isoDate))
  } catch {
    return isoDate
  }
}

const formatSlotLabel = (slot: AvailabilitySlot) =>
  `${formatTime(slot.start, slot.timeZone)} تا ${formatTime(slot.end, slot.timeZone)}`

const SchedulePicker = ({
  availability,
  selectedDay,
  selectedSlotId,
  onSelectDay,
  onSelectSlot,
  isLoading = false,
  placeholderMessage,
  emptyMessage,
}: SchedulePickerProps) => {
  const prefersReducedMotion = useReducedMotion()
  const totalSlots = useMemo(
    () =>
      availability?.reduce((count, day) => {
        return count + day.slots.length
      }, 0) ?? 0,
    [availability],
  )
  const hasDenseSchedule = totalSlots > 24
  const reduceInteractiveMotion = Boolean(prefersReducedMotion) || hasDenseSchedule

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-2xl border border-white/15 bg-white/30 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-black/35"
          >
            <div className="h-6 w-2/3 rounded-full bg-white/60 dark:bg-black/60" />
            <div className="mt-6 space-y-2">
              <div className="h-8 rounded-xl bg-white/50 dark:bg-black/50" />
              <div className="h-8 rounded-xl bg-white/40 dark:bg-black/45" />
              <div className="h-8 rounded-xl bg-white/30 dark:bg-black/40" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!availability) {
    return (
      <div className="rounded-2xl border border-dashed border-white/30 bg-white/30 p-6 text-sm text-muted-foreground dark:border-white/15 dark:bg-black/30">
        {placeholderMessage ?? 'ابتدا یک روز یا خدمت را انتخاب کنید تا زمان‌های آزاد نمایش داده شود.'}
      </div>
    )
  }

  if (availability.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/30 bg-white/30 p-6 text-sm text-muted-foreground dark:border-white/15 dark:bg-black/30">
        {emptyMessage ?? 'در حال حاضر زمانی در دسترس نیست. لطفاً به زودی دوباره سر بزنید.'}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {availability.map((day) => {
        const isActiveDay = selectedDay === day.date
        const { weekday, label } = formatDayHeading(day.date)
        const dayLabelParts = [weekday, label].filter(Boolean)
        const dayDescription = dayLabelParts.length > 0 ? dayLabelParts.join('، ') : day.date

        return (
          <div
            key={day.date}
            className={clsx(
              'flex h-full flex-col gap-3 rounded-2xl border p-4',
              reduceInteractiveMotion
                ? 'transition-opacity duration-200'
                : 'transition-all duration-300',
              'border-white/20 bg-white/45 shadow-[0_18px_40px_-30px_rgba(31,38,135,0.35)] backdrop-blur-sm',
              'dark:border-white/10 dark:bg-black/40',
              isActiveDay &&
                'border-accent/60 bg-accent/15 shadow-[0_24px_45px_-30px_rgba(88,175,192,0.5)] dark:border-accent/40 dark:bg-accent/10',
            )}
          >
            <button
              type="button"
              className={clsx(
                'flex flex-col items-end gap-1 rounded-xl border px-3 py-2 text-right',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60',
                reduceInteractiveMotion
                  ? 'transition-opacity duration-150 hover:opacity-95 focus-visible:opacity-95'
                  : 'transition-colors duration-200 hover:border-accent/50 hover:bg-white/70',
                reduceInteractiveMotion
                  ? 'border-white/30 bg-white/60'
                  : 'border-white/30 bg-white/55',
                reduceInteractiveMotion
                  ? 'dark:border-white/15 dark:bg-black/55 dark:hover:opacity-90'
                  : 'dark:border-white/15 dark:bg-black/50 dark:hover:border-accent/40 dark:hover:bg-black/60',
                isActiveDay && 'border-accent/60 bg-accent/20 text-accent',
              )}
              onClick={() => onSelectDay?.(day)}
              aria-pressed={isActiveDay}
              aria-label={dayDescription}
            >
              <span className="text-xs font-semibold text-muted-foreground">{weekday || '—'}</span>
              <span className="text-sm font-bold text-foreground">{label}</span>
              {day.note ? <span className="text-[11px] text-accent-strong/80">{day.note}</span> : null}
            </button>

            <div className="flex flex-col gap-2">
              {day.slots.length === 0 ? (
                <span className="rounded-xl border border-dashed border-white/30 px-3 py-2 text-xs text-muted-foreground dark:border-white/15">
                  برای این روز زمانی در دسترس نیست.
                </span>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {day.slots.map((slot) => {
                    const slotId = slot.id
                    const isSelected = isActiveDay && selectedSlotId === slotId
                    const slotAriaLabelParts = [
                      dayDescription,
                      formatSlotLabel(slot),
                      slot.providerName ? `با ${slot.providerName}` : undefined,
                      slot.serviceName ? `برای ${slot.serviceName}` : undefined,
                      slot.kind === 'virtual' ? 'مشاوره آنلاین' : undefined,
                    ].filter((part): part is string => Boolean(part))
                    const slotAriaLabel = slotAriaLabelParts.join('، ')

                    return (
                      <button
                        type="button"
                        key={slotId}
                        className={clsx(
                          'flex flex-col items-end gap-1 rounded-xl border px-3 py-2 text-right text-xs font-medium',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60',
                          reduceInteractiveMotion
                            ? 'transition-opacity duration-150 hover:opacity-95 focus-visible:opacity-95'
                            : 'transition-all duration-200 hover:border-accent/50 hover:bg-white/75',
                          reduceInteractiveMotion
                            ? 'border-white/25 bg-white/60'
                            : 'border-white/25 bg-white/55',
                          reduceInteractiveMotion
                            ? 'dark:border-white/15 dark:bg-black/50 dark:hover:opacity-90'
                            : 'dark:border-white/15 dark:bg-black/45 dark:hover:border-accent/40 dark:hover:bg-black/55',
                          isSelected &&
                            'border-accent/70 bg-accent/20 text-accent shadow-[0_16px_36px_-28px_rgba(88,175,192,0.6)]',
                        )}
                        onClick={() => {
                          onSelectDay?.(day)
                          onSelectSlot?.(slot, day)
                        }}
                        aria-pressed={isSelected}
                        aria-label={slotAriaLabel}
                      >
                        <span className="font-semibold">{formatSlotLabel(slot)}</span>
                        <span className="text-[10px] text-muted-foreground">{slot.providerName}</span>
                        <span className="text-[10px] text-muted-foreground">{slot.serviceName}</span>
                        {slot.kind === 'virtual' ? (
                          <span className="text-[10px] text-accent-strong/80">مشاوره آنلاین</span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SchedulePicker
