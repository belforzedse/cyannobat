'use client';

import { useCallback, useEffect, useState } from 'react';

import Button from '@/components/ui/Button';

export type ThemePreferences = {
  colorScheme: 'system' | 'light' | 'dark' | 'high-contrast';
  accentColor?: string;
  density: 'compact' | 'comfortable' | 'spacious';
};

export type ThemeCustomizerProps = {
  patientId?: string;
};

const DEFAULT_PREFERENCES: ThemePreferences = {
  colorScheme: 'system',
  accentColor: 'emerald',
  density: 'comfortable',
};

export const ThemeCustomizer = ({ patientId }: ThemeCustomizerProps) => {
  const [preferences, setPreferences] = useState<ThemePreferences>(DEFAULT_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    const params = new URLSearchParams();
    if (patientId) params.set('patientId', patientId);

    const response = await fetch(`/api/staff/theme?${params.toString()}`, {
      credentials: 'include',
    });

    if (!response.ok) return;

    const payload = (await response.json()) as { preferences?: ThemePreferences };
    if (payload.preferences) {
      setPreferences({ ...DEFAULT_PREFERENCES, ...payload.preferences });
    }
  }, [patientId]);

  useEffect(() => {
    loadPreferences().catch(() => {
      setStatusMessage('خواندن تنظیمات تم با مشکل مواجه شد.');
    });
  }, [loadPreferences]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSaving(true);
      setStatusMessage(null);

      try {
        const response = await fetch('/api/staff/theme', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, preferences }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error((body as { message?: string }).message ?? 'Failed to save preferences');
        }

        setStatusMessage('تنظیمات شخصی‌سازی با موفقیت ذخیره شد.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'ذخیره تنظیمات انجام نشد';
        setStatusMessage(message);
      } finally {
        setIsSaving(false);
      }
    },
    [patientId, preferences],
  );

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground">شخصی‌سازی تم</h3>
        <p className="text-sm text-muted-foreground">تنظیم تجربه کاربری ویژه برای پرونده بیمار.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">طرح رنگی</span>
            <select
              className="rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
              value={preferences.colorScheme}
              onChange={(event) =>
                setPreferences((prev) => ({ ...prev, colorScheme: event.target.value as ThemePreferences['colorScheme'] }))
              }
            >
              <option value="system">سیستم</option>
              <option value="light">روشن</option>
              <option value="dark">تاریک</option>
              <option value="high-contrast">کنتراست بالا</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">رنگ تأکیدی</span>
            <input
              className="rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
              value={preferences.accentColor ?? ''}
              onChange={(event) => setPreferences((prev) => ({ ...prev, accentColor: event.target.value }))}
              placeholder="مثلاً emerald یا sky"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">چگالی</span>
            <select
              className="rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
              value={preferences.density}
              onChange={(event) =>
                setPreferences((prev) => ({ ...prev, density: event.target.value as ThemePreferences['density'] }))
              }
            >
              <option value="compact">فشرده</option>
              <option value="comfortable">راحت</option>
              <option value="spacious">گسترده</option>
            </select>
          </label>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>این تنظیمات برای تیم معالج و بیمار ذخیره می‌شود.</span>
          <Button type="submit" disabled={isSaving} size="sm">
            {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </Button>
        </div>

        {statusMessage && (
          <div className="rounded-xl border border-border/40 bg-background/80 px-4 py-3 text-xs text-foreground">
            {statusMessage}
          </div>
        )}
      </form>
    </section>
  );
};

export default ThemeCustomizer;
