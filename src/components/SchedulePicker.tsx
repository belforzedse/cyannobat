'use client';

import clsx from 'clsx';
import type { DeliveryDay, DeliveryWindowSlot } from '@/data/mockDeliveryWindows';

type SchedulePickerProps = {
  days?: DeliveryDay[];
  selectedDate?: string | null;
  selectedSlotId?: string | null;
  onSelectDate?: (day: DeliveryDay) => void;
  onSelectSlot?: (slot: DeliveryWindowSlot, day: DeliveryDay) => void;
  isLoading?: boolean;
  placeholderMessage?: string;
  emptyMessage?: string;
};

const formatDayHeading = (date: string) => {
  try {
    const dateInstance = new Date(`${date}T00:00:00`);
    const weekday = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(dateInstance);
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

const formatSlotLabel = (slot: DeliveryWindowSlot) => slot.label ?? `${formatTime(slot.start)} تا ${formatTime(slot.end)}`;

const SchedulePicker = ({
  days,
  selectedDate,
  selectedSlotId,
  onSelectDate,
  onSelectSlot,
  isLoading = false,
  placeholderMessage,
  emptyMessage,
}: SchedulePickerProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 w-36 animate-pulse rounded-full border border-white/15 bg-white/30 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
            />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-2xl border border-white/15 bg-white/30 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!days) {
    return (
      <div className="rounded-2xl border border-dashed border-white/30 bg-white/30 p-6 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
        {placeholderMessage ?? 'برای مشاهده بازه‌های تحویل، ابتدا یک تاریخ را انتخاب کنید.'}
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/30 bg-white/30 p-6 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
        {emptyMessage ?? 'هیچ بازه تحویلی در دسترس نیست.'}
      </div>
    );
  }

  const activeDay = selectedDate ? days.find((day) => day.date === selectedDate) : undefined;

  return (
    <div className="space-y-6">
      <div className="flex snap-x gap-3 overflow-x-auto pb-2">
        {days.map((day) => {
          const isActive = activeDay?.date === day.date;
          const { weekday, label } = formatDayHeading(day.date);

          return (
            <button
              type="button"
              key={day.date}
              className={clsx(
                'relative flex min-w-[8.5rem] snap-center flex-col items-end gap-1 rounded-full border px-4 py-3 text-right transition-all duration-200',
                'border-white/25 bg-white/45 hover:border-accent/60 hover:bg-white/70',
                'dark:border-white/12 dark:bg-white/10 dark:hover:border-accent/50 dark:hover:bg-white/20',
                isActive && 'border-accent/70 bg-accent/20 text-accent shadow-[0_20px_45px_-30px_rgba(88,175,192,0.6)] dark:text-accent-foreground'
              )}
              onClick={() => onSelectDate?.(day)}
              aria-pressed={isActive}
            >
              <span className="text-xs font-semibold text-muted-foreground">{weekday || '—'}</span>
              <span className="text-sm font-bold text-foreground">{label}</span>
              {day.shippingLabel && <span className="text-[11px] text-muted-foreground">{day.shippingLabel}</span>}
              {day.badge && (
                <span className="absolute left-4 top-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                  {day.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeDay ? (
        <div className="space-y-4">
          {activeDay.note && (
            <div className="rounded-2xl border border-white/20 bg-white/40 p-4 text-xs text-muted-foreground dark:border-white/12 dark:bg-white/10">
              {activeDay.note}
            </div>
          )}

          {activeDay.groups.length > 0 ? (
            activeDay.groups.map((group) => (
              <div
                key={`${activeDay.date}-${group.label}`}
                className="rounded-2xl border border-white/20 bg-white/45 shadow-[0_18px_40px_-30px_rgba(31,38,135,0.35)] backdrop-blur-sm dark:border-white/12 dark:bg-white/10"
              >
                <div className="flex flex-col gap-1 border-b border-white/15 px-4 py-3 text-right dark:border-white/10">
                  <span className="text-sm font-semibold text-foreground">{group.label}</span>
                  {group.note && <span className="text-xs text-muted-foreground">{group.note}</span>}
                </div>
                <div className="flex flex-col gap-2 p-4">
                  {group.windows.map((slot) => {
                    const isSelected = activeDay.date === selectedDate && selectedSlotId === slot.id;

                    return (
                      <button
                        type="button"
                        key={slot.id}
                        className={clsx(
                          'flex flex-col items-end gap-1 rounded-xl border px-3 py-2 text-right text-sm transition-all duration-200',
                          'border-white/25 bg-white/55 hover:border-accent/60 hover:bg-white/75',
                          'dark:border-white/12 dark:bg-white/12 dark:hover:border-accent/50 dark:hover:bg-white/20',
                          isSelected && 'border-accent/70 bg-accent/20 text-accent shadow-[0_16px_36px_-28px_rgba(88,175,192,0.6)]'
                        )}
                        onClick={() => {
                          onSelectDate?.(activeDay);
                          onSelectSlot?.(slot, activeDay);
                        }}
                        aria-pressed={isSelected}
                      >
                        <span className="font-medium">{formatSlotLabel(slot)}</span>
                        {slot.description && <span className="text-xs text-muted-foreground">{slot.description}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/25 bg-white/40 p-6 text-center text-sm text-muted-foreground dark:border-white/12 dark:bg-white/10">
              {emptyMessage ?? 'برای این روز بازه‌ای تعریف نشده است.'}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/30 bg-white/30 p-6 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
          {placeholderMessage ?? 'برای مشاهده بازه‌های تحویل، یکی از تاریخ‌ها را انتخاب کنید.'}
        </div>
      )}
    </div>
  );
};

export default SchedulePicker;
