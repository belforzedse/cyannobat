'use client';

import { useEffect, useState } from 'react';

import { X, Plus } from 'lucide-react';

import { Button, Input } from '@/components/ui';
import { glassPanelStyles } from '@/components/ui/glass';
import { cn } from '@/lib/utils';
import type { StaffProvider } from '@/lib/staff/types';

import { toISOStringOrNull } from '@/lib/staff/dashboard/utils';
import type {
  CreateAppointmentPayload,
  CreateAppointmentResult,
} from '@/lib/staff/dashboard/hooks';

export type CreateAppointmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  providers: StaffProvider[];
  isCreating: boolean;
  onSubmit: (payload: CreateAppointmentPayload) => Promise<CreateAppointmentResult>;
};

type CreateFormState = {
  clientId: string;
  serviceId: string;
  providerId: string;
  start: string;
  end: string;
  timeZone: string;
};

const initialFormState: CreateFormState = {
  clientId: '',
  serviceId: '',
  providerId: '',
  start: '',
  end: '',
  timeZone: '',
};

export const CreateAppointmentModal = ({
  isOpen,
  onClose,
  providers,
  isCreating,
  onSubmit,
}: CreateAppointmentModalProps) => {
  const [form, setForm] = useState<CreateFormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm(initialFormState);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const clientId = form.clientId.trim();
    const serviceId = form.serviceId.trim();
    const providerId = form.providerId.trim();
    const startISO = toISOStringOrNull(form.start);
    const endISO = toISOStringOrNull(form.end);

    if (!clientId || !serviceId || !providerId) {
      const message = 'لطفاً تمام فیلدها را تکمیل کنید.';
      setError(message);
      return;
    }

    if (!startISO || !endISO) {
      const message = 'زمان نوبت معتبر نیست.';
      setError(message);
      return;
    }

    if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
      const message = 'بازه زمانی معتبر نیست.';
      setError(message);
      return;
    }

    const provider = providers.find((item) => item.id === providerId);
    const timeZone = form.timeZone.trim() || provider?.timeZone || 'UTC';

    const result = await onSubmit({
      clientId,
      serviceId,
      providerId,
      start: startISO,
      end: endISO,
      timeZone,
    });

    if (result.success) {
      setForm(initialFormState);
      setError(null);
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">رزرو نوبت جدید</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
            aria-label="بستن فرم ایجاد نوبت"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="شناسه بیمار"
            value={form.clientId}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, clientId: event.target.value }))
            }
            autoComplete="off"
          />
          <Input
            label="شناسه خدمت"
            value={form.serviceId}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, serviceId: event.target.value }))
            }
            autoComplete="off"
          />
          <div className="flex flex-col gap-1">
            <label
              htmlFor="create-provider-select"
              className="text-right text-sm font-medium text-foreground"
            >
              ارائه‌دهنده
            </label>
            <select
              id="create-provider-select"
              value={form.providerId}
              onChange={(event) => {
                const nextProvider = event.target.value;
                const provider = providers.find((item) => item.id === nextProvider);
                setForm((previous) => ({
                  ...previous,
                  providerId: nextProvider,
                  timeZone: provider?.timeZone ?? previous.timeZone,
                }));
              }}
              className={cn(
                glassPanelStyles(),
                'rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40',
              )}
            >
              <option value="">یک ارائه‌دهنده را انتخاب کنید</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.displayName}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="زمان شروع"
            type="datetime-local"
            value={form.start}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, start: event.target.value }))
            }
          />
          <Input
            label="زمان پایان"
            type="datetime-local"
            value={form.end}
            onChange={(event) => setForm((previous) => ({ ...previous, end: event.target.value }))}
          />
          <Input
            label="منطقه زمانی"
            value={form.timeZone}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, timeZone: event.target.value }))
            }
            placeholder="مثال: Asia/Tehran"
          />
          {error && <p className="text-right text-xs text-red-500">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isCreating}
              className="gap-2"
            >
              انصراف
            </Button>
            <Button type="submit" size="sm" isLoading={isCreating} className="gap-2">
              <Plus className="h-4 w-4" />
              ایجاد نوبت
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
