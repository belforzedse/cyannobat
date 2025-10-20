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
            className="h-44 animate-pulse rounded-2xl border border-white/15 bg-white/30 p-4 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/65"
          >
            <div className="h-6 w-2/3 rounded-full bg-white/60 dark:bg-slate-700/70" />
            <div className="mt-6 space-y-2">
              <div className="h-8 rounded-xl bg-white/50 dark:bg-slate-800/70" />
              <div className="h-8 rounded-xl bg-white/40 dark:bg-slate-800/65" />
              <div className="h-8 rounded-xl bg-white/30 dark:bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!availability) {
    return (
      <div className="rounded-2xl border border-dashed border-white/30 bg-white/30 p-6 text-sm text-muted-foreground dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-300">
        {placeholderMessage ?? 'ابتدا یک روز یا خدمت را انتخاب کنید تا زمان‌های آزاد نمایش داده شود.'}
      </div>
    )
  }

  if (availability.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/30 bg-white/30 p-6 text-sm text-muted-foreground dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-300">
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
              'dark:border-slate-800/80 dark:bg-slate-900/85 dark:text-slate-100 dark:shadow-[0_18px_40px_-30px_rgba(4,16,48,0.7)]',
              isActiveDay &&
                'border-accent/60 bg-accent/15 shadow-[0_24px_45px_-30px_rgba(88,175,192,0.5)] dark:border-accent/60 dark:bg-accent/25 dark:text-accent-foreground',
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
                  ? 'dark:border-slate-700/80 dark:bg-slate-800/85 dark:hover:opacity-95'
                  : 'dark:border-slate-700/80 dark:bg-slate-800/80 dark:hover:border-accent/50 dark:hover:bg-slate-800/95',
                'dark:text-slate-100',
                isActiveDay && 'border-accent/60 bg-accent/20 text-accent dark:text-accent-foreground',
              )}
              onClick={() => onSelectDay?.(day)}
              aria-pressed={isActiveDay}
              aria-label={dayDescription}
            >
              <span className="text-xs font-semibold text-muted-foreground dark:text-slate-300">{weekday || '—'}</span>
              <span className="text-sm font-bold text-foreground dark:text-white">{label}</span>
              {day.note ? (
                <span className="text-[11px] text-accent-strong/80 dark:text-accent-foreground/90">{day.note}</span>
              ) : null}
            </button>

            <div className="flex flex-col gap-2">
              {day.slots.length === 0 ? (
                <span className="rounded-xl border border-dashed border-white/30 px-3 py-2 text-xs text-muted-foreground dark:border-slate-700/80 dark:text-slate-300">
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
                            ? 'dark:border-slate-700/70 dark:bg-slate-800/75 dark:hover:opacity-95'
                            : 'dark:border-slate-700/70 dark:bg-slate-800/70 dark:hover:border-accent/50 dark:hover:bg-slate-800/95',
                          'dark:text-slate-100',
                          isSelected &&
                            'border-accent/70 bg-accent/20 text-accent shadow-[0_16px_36px_-28px_rgba(88,175,192,0.6)] dark:text-accent-foreground dark:shadow-[0_18px_40px_-28px_rgba(88,175,192,0.55)]',
                        )}
                        onClick={() => {
                          onSelectDay?.(day)
                          onSelectSlot?.(slot, day)
                        }}
                        aria-pressed={isSelected}
                        aria-label={slotAriaLabel}
                      >
                        <span className="font-semibold">{formatSlotLabel(slot)}</span>
                        <span className="text-[10px] text-muted-foreground dark:text-slate-300">{slot.providerName}</span>
                        <span className="text-[10px] text-muted-foreground dark:text-slate-300">{slot.serviceName}</span>
                        {slot.kind === 'virtual' ? (
                          <span className="text-[10px] text-accent-strong/80 dark:text-accent-foreground/90">مشاوره آنلاین</span>
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
