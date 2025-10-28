'use client'

import { KeyboardEvent, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

import type { AvailabilityDay, AvailabilitySlot } from '@/features/booking/types'
import { luxuryContainer, luxurySlideFade } from '@/lib/luxuryAnimations'
import { Card, Chip } from '@/components/ui'
import { glassPanelClassName } from '@/components/ui/glass'

const MotionCard = motion(Card)
const MotionChip = motion(Chip)

const handleInteractiveKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  callback: () => void,
) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    callback()
  }
}

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
  const containerVariants = reduceInteractiveMotion ? undefined : luxuryContainer
  const dayVariants = reduceInteractiveMotion
    ? undefined
    : luxurySlideFade('up', {
        distance: 24,
        duration: 0.55,
        delayIn: 0.05,
      })
  const slotContainerVariants = reduceInteractiveMotion ? undefined : luxuryContainer
  const slotVariants = reduceInteractiveMotion
    ? undefined
    : luxurySlideFade('up', {
        distance: 16,
        duration: 0.45,
        delayIn: 0.04,
      })

  const motionStates = reduceInteractiveMotion ? {} : { initial: 'initial' as const, animate: 'animate' as const }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={glassPanelClassName(
              'muted',
              'h-44 animate-pulse rounded-2xl p-4 sm:rounded-3xl'
            )}
          >
            <div className="h-6 w-2/3 rounded-full bg-card/80 dark:bg-card/65" />
            <div className="mt-6 space-y-2">
              <div className="h-8 rounded-xl bg-card/75 dark:bg-card/55" />
              <div className="h-8 rounded-xl bg-card/70 dark:bg-card/50" />
              <div className="h-8 rounded-xl bg-card/65 dark:bg-card/45" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!availability) {
    return (
      <div
        className={glassPanelClassName(
          'muted',
          'border-dashed p-6 text-sm text-muted-foreground'
        )}
      >
        {placeholderMessage ?? 'ابتدا یک روز یا خدمت را انتخاب کنید تا زمان‌های آزاد نمایش داده شود.'}
      </div>
    )
  }

  if (availability.length === 0) {
    return (
      <div
        className={glassPanelClassName(
          'muted',
          'border-dashed p-6 text-sm text-muted-foreground'
        )}
      >
        {emptyMessage ?? 'در حال حاضر زمانی در دسترس نیست. لطفاً به زودی دوباره سر بزنید.'}
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      variants={containerVariants}
      {...motionStates}
    >
      {availability.map((day) => {
        const isActiveDay = selectedDay === day.date
        const { weekday, label } = formatDayHeading(day.date)
        const dayLabelParts = [weekday, label].filter(Boolean)
        const dayDescription = dayLabelParts.length > 0 ? dayLabelParts.join('، ') : day.date

        return (
          <MotionCard
            key={day.date}
            variant={isActiveDay ? 'accent' : 'muted'}
            padding="md"
            className={cn(
              'flex h-full flex-col gap-3 rounded-2xl sm:rounded-3xl',
              reduceInteractiveMotion
                ? 'transition-opacity duration-200'
                : 'transition-all duration-300',
              'border-border/35 bg-card/85 shadow-[0_18px_40px_-30px_rgba(31,38,135,0.32)] backdrop-blur-sm',
              'dark:border-border/45 dark:bg-card/70 dark:text-foreground dark:shadow-[0_18px_40px_-30px_rgba(6,16,35,0.68)]',
            )}
            variants={dayVariants}
          >
            <Chip
              role="button"
              tabIndex={0}
              interactive
              variant={isActiveDay ? 'active' : 'default'}
              className={clsx(
                '!flex w-full flex-col items-end gap-1 text-right',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60',
                reduceInteractiveMotion
                  ? 'transition-opacity duration-150 hover:opacity-95 focus-visible:opacity-95'
                  : 'transition-colors duration-200 hover:border-accent/50 hover:bg-white/70',
                reduceInteractiveMotion
                  ? 'border-white/30 bg-white/60'
                  : 'border-white/30 bg-white/55',
                reduceInteractiveMotion
                  ? 'dark:border-border/45 dark:bg-card/60 dark:hover:opacity-95'
                  : 'dark:border-border/45 dark:bg-card/55 dark:hover:border-accent/45 dark:hover:bg-card/65',
                'dark:text-foreground',
                isActiveDay && 'dark:text-accent-foreground',
              )}
              onClick={() => onSelectDay?.(day)}
              onKeyDown={(event) => handleInteractiveKeyDown(event, () => onSelectDay?.(day))}
              aria-pressed={isActiveDay}
              aria-label={dayDescription}
            >
              <span className="self-end text-xs font-semibold text-muted-foreground dark:text-slate-300">
                {weekday || '—'}
              </span>
              <span className="self-end text-sm font-bold text-foreground dark:text-white">{label}</span>
              {day.note ? (
                <span className="self-end text-[11px] text-accent-strong/80 dark:text-accent-foreground/90">
                  {day.note}
                </span>
              ) : null}
            </Chip>

            <div className="flex flex-col gap-2">
              {day.slots.length === 0 ? (
                <span className="rounded-xl border border-dashed border-border/35 px-3 py-2 text-xs text-muted-foreground dark:border-border/45 dark:text-muted-foreground">
                  برای این روز زمانی در دسترس نیست.
                </span>
              ) : (
                <motion.div
                  className="grid grid-cols-2 gap-2"
                  variants={slotContainerVariants}
                  {...motionStates}
                >
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
                      <MotionChip
                        key={slotId}
                        role="button"
                        tabIndex={0}
                        interactive
                        variant={isSelected ? 'active' : 'default'}
                        className={clsx(
                          '!flex w-full flex-col items-end gap-1 text-right text-xs font-medium',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60',
                          reduceInteractiveMotion
                            ? 'transition-opacity duration-150 hover:opacity-95 focus-visible:opacity-95'
                            : 'transition-all duration-200 hover:border-accent/50 hover:bg-white/75',
                          reduceInteractiveMotion
                            ? 'border-white/25 bg-white/60'
                            : 'border-white/25 bg-white/55',
                          reduceInteractiveMotion
                            ? 'dark:border-border/45 dark:bg-card/60 dark:hover:opacity-95'
                            : 'dark:border-border/45 dark:bg-card/55 dark:hover:border-accent/45 dark:hover:bg-card/65',
                          'dark:text-foreground',
                          isSelected && 'dark:text-accent-foreground',
                        )}
                        onClick={() => {
                          onSelectDay?.(day)
                          onSelectSlot?.(slot, day)
                        }}
                        onKeyDown={(event) =>
                          handleInteractiveKeyDown(event, () => {
                            onSelectDay?.(day)
                            onSelectSlot?.(slot, day)
                          })
                        }
                        aria-pressed={isSelected}
                        aria-label={slotAriaLabel}
                        variants={slotVariants}
                      >
                        <span className="self-end text-sm font-semibold">{formatSlotLabel(slot)}</span>
                        <span className="self-end text-[10px] text-muted-foreground dark:text-muted-foreground">
                          {slot.providerName}
                        </span>
                        <span className="self-end text-[10px] text-muted-foreground dark:text-muted-foreground">
                          {slot.serviceName}
                        </span>
                        {slot.kind === 'virtual' ? (
                          <span className="self-end text-[10px] text-accent-strong/80 dark:text-accent-foreground/90">
                            مشاوره آنلاین
                          </span>
                        ) : null}
                      </MotionChip>
                    )
                  })}
                </motion.div>
              )}
            </div>
          </MotionCard>
        )
      })}
    </motion.div>
  )
}

export default SchedulePicker
