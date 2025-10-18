'use client';

import clsx from 'clsx';
import type { AvailabilityDay, AvailabilitySlot } from '@/data/mockAvailability';

type SchedulePickerProps = {
  availability?: AvailabilityDay[];
  selectedDay?: string | null;
  selectedSlotId?: string | null;
  onSelectDay?: (day: AvailabilityDay) => void;
  onSelectSlot?: (slot: AvailabilitySlot, day: AvailabilityDay) => void;
  isLoading?: boolean;
  placeholderMessage?: string;
  emptyMessage?: string;
};

const formatDayHeading = (date: string) => {
  try {
    const dateInstance = new Date(`${date}T00:00:00`);
    const weekday = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(dateInstance);
    const label = new Intl.DateTimeFormat('fa-IR', { month: 'long', day: 'numeric' }).format(dateInstance);
    return { weekday, label };
  } catch {
    return { weekday: '', label: date };
  }
};

const formatTime = (time: string) => {
  const [hour, minute] = time.split(':').map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }

  const dateInstance = new Date(Date.UTC(2024, 0, 1, hour, minute));
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }).format(dateInstance);
  } catch {
    return time;
  }
};

const formatSlotLabel = (slot: AvailabilitySlot) => `${formatTime(slot.start)} تا ${formatTime(slot.end)}`;

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
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-44 rounded-2xl border border-white/15 bg-white/30 p-4 backdrop-blur-sm animate-pulse dark:border-white/10 dark:bg-white/5"
          >
            <div className="h-6 w-2/3 rounded-full bg-white/60 dark:bg-white/10" />
            <div className="mt-6 space-y-2">
              <div className="h-8 rounded-xl bg-white/50 dark:bg-white/10" />
              <div className="h-8 rounded-xl bg-white/40 dark:bg-white/10" />
              <div className="h-8 rounded-xl bg-white/30 dark:bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="rounded-2xl border border-dashed border-white/30 bg-white/30 p-6 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
        {placeholderMessage ?? 'برای مشاهده زمان‌های آزاد، ابتدا خدمت و پزشک را انتخاب کنید.'}
      </div>
    );
  }

  if (availability.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/30 bg-white/30 p-6 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
        {emptyMessage ?? 'در حال حاضر زمان آزادی برای این ترکیب وجود ندارد.'}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {availability.map((day) => {
        const isActiveDay = selectedDay === day.date;
        const { weekday, label } = formatDayHeading(day.date);

        return (
          <div
            key={day.date}
            className={clsx(
              'flex h-full flex-col gap-3 rounded-2xl border p-4 transition-all duration-300',
              'border-white/20 bg-white/45 shadow-[0_18px_40px_-30px_rgba(31,38,135,0.35)] backdrop-blur-sm',
              'dark:border-white/12 dark:bg-white/10',
              isActiveDay && 'border-accent/60 bg-accent/15 shadow-[0_24px_45px_-30px_rgba(88,175,192,0.5)] dark:border-accent/40 dark:bg-accent/10'
            )}
          >
            <button
              type="button"
              className={clsx(
                'flex flex-col items-end gap-1 rounded-xl border px-3 py-2 text-right transition-colors duration-200',
                'border-white/30 bg-white/55 hover:border-accent/50 hover:bg-white/70',
                'dark:border-white/10 dark:bg-white/10 dark:hover:border-accent/40 dark:hover:bg-white/15',
                isActiveDay && 'border-accent/60 bg-accent/20 text-accent'
              )}
              onClick={() => onSelectDay?.(day)}
              aria-pressed={isActiveDay}
            >
              <span className="text-xs font-semibold text-muted-foreground">{weekday || '—'}</span>
              <span className="text-sm font-bold text-foreground">{label}</span>
              {day.note && <span className="text-[11px] text-accent-strong/80">{day.note}</span>}
            </button>

            <div className="flex flex-col gap-2">
              {day.slots.length === 0 ? (
                <span className="rounded-xl border border-dashed border-white/30 px-3 py-2 text-xs text-muted-foreground dark:border-white/15">
                  زمان خالی برای این روز موجود نیست.
                </span>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {day.slots.map((slot) => {
                    const slotId = slot.id;
                    const isSelected = isActiveDay && selectedSlotId === slotId;

                    return (
                      <button
                        type="button"
                        key={slotId}
                        className={clsx(
                          'flex flex-col items-end gap-1 rounded-xl border px-3 py-2 text-right text-xs font-medium transition-all duration-200',
                          'border-white/25 bg-white/55 hover:border-accent/50 hover:bg-white/75',
                          'dark:border-white/12 dark:bg-white/12 dark:hover:border-accent/40 dark:hover:bg-white/20',
                          isSelected && 'border-accent/70 bg-accent/20 text-accent shadow-[0_16px_36px_-28px_rgba(88,175,192,0.6)]'
                        )}
                        onClick={() => {
                          onSelectDay?.(day);
                          onSelectSlot?.(slot, day);
                        }}
                        aria-pressed={isSelected}
                      >
                        <span>{formatSlotLabel(slot)}</span>
                        {slot.kind === 'virtual' && <span className="text-[10px] text-accent-strong/80">مشاوره آنلاین</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SchedulePicker;
