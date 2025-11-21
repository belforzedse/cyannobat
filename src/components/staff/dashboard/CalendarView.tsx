'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/primitives/Button';

export type CalendarViewMode = 'weekly' | 'monthly';

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  providerName?: string | null;
  patientName?: string | null;
};

export type CalendarViewProps = {
  initialMode?: CalendarViewMode;
  providerId?: string;
};

const formatDate = (value: string, options?: Intl.DateTimeFormatOptions) => {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', options);
    return formatter.format(new Date(value));
  } catch {
    return value;
  }
};

const groupEventsByDay = (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
  return events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const dayKey = event.start.slice(0, 10);
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(event);
    return acc;
  }, {});
};

export const CalendarView = ({ initialMode = 'weekly', providerId }: CalendarViewProps) => {
  const [mode, setMode] = useState<CalendarViewMode>(initialMode);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchEvents = useCallback(
    async (targetMode: CalendarViewMode) => {
      setIsLoading(true);
      setErrorMessage(null);

      const params = new URLSearchParams({ view: targetMode });
      if (providerId) {
        params.set('providerId', providerId);
      }

      try {
        const response = await fetch(`/api/staff/calendar?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error((body as { message?: string }).message ?? 'Failed to load calendar data');
        }

        const payload = (await response.json()) as { events?: CalendarEvent[] };
        setEvents(Array.isArray(payload.events) ? payload.events : []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'خطا در دریافت برنامه. لطفاً دوباره تلاش کنید.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    },
    [providerId],
  );

  useEffect(() => {
    fetchEvents(mode);
  }, [mode, fetchEvents]);

  const groupedEvents = useMemo(() => {
    const groups = groupEventsByDay(events);
    return Object.entries(groups)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, dayEvents]) => ({ date, events: dayEvents }));
  }, [events]);

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">تقویم ملاقات‌ها</h3>
          <p className="text-sm text-muted-foreground">نمای {mode === 'weekly' ? 'هفتگی' : 'ماهانه'} برای برنامه‌ریزی دقیق‌تر.</p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background p-1">
          {(['weekly', 'monthly'] as CalendarViewMode[]).map((viewMode) => (
            <Button
              key={viewMode}
              type="button"
              variant={viewMode === mode ? 'primary' : 'ghost'}
              size="sm"
              className="rounded-full px-4 py-1 text-sm"
              onClick={() => setMode(viewMode)}
            >
              {viewMode === 'weekly' ? 'هفتگی' : 'ماهانه'}
            </Button>
          ))}
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            در حال بروزرسانی تقویم...
          </div>
        )}

        {!isLoading && groupedEvents.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">موردی برای نمایش وجود ندارد.</div>
        )}

        {groupedEvents.map(({ date, events: dayEvents }) => (
          <article key={date} className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              {formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h4>

            <ul className="space-y-3">
              {dayEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-col gap-1 rounded-xl border border-border/40 bg-background/80 p-4 transition hover:border-accent/40 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{event.title}</span>
                    <span className="text-muted-foreground">
                      {formatDate(event.start, { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {formatDate(event.end, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {event.providerName ? `پزشک: ${event.providerName}` : null}
                    {event.providerName && event.patientName ? ' · ' : null}
                    {event.patientName ? `بیمار: ${event.patientName}` : null}
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CalendarView;
