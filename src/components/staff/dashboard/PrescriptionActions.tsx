'use client';

import { FormEvent, useCallback, useState } from 'react';

import Button from '@/components/ui/primitives/Button';

export type PrescriptionFormValues = {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
};

export type PrescriptionActionsProps = {
  patientId?: string;
  appointmentId?: string;
};

export const PrescriptionActions = ({ patientId, appointmentId }: PrescriptionActionsProps) => {
  const [formValues, setFormValues] = useState<PrescriptionFormValues>({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasTarget = Boolean(patientId || appointmentId);

  const handleChange = useCallback(
    (field: keyof PrescriptionFormValues) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormValues((previous) => ({ ...previous, [field]: event.target.value }));
      },
    [],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        if (!hasTarget) {
          throw new Error('Patient or appointment context is required.');
        }

        const response = await fetch('/api/staff/prescriptions', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formValues, patientId, appointmentId }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error((body as { message?: string }).message ?? 'Failed to create prescription');
        }

        setSuccessMessage('نسخه الکترونیکی با موفقیت ثبت شد.');
        setFormValues({ medication: '', dosage: '', frequency: '', duration: '', notes: '' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'ثبت نسخه انجام نشد';
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [appointmentId, formValues, hasTarget, patientId],
  );

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground">نسخه و دستورات درمانی</h3>
        <p className="text-sm text-muted-foreground">ارسال نسخه الکترونیکی و دستورالعمل‌های درمانی برای بیمار.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted-foreground">نام دارو</span>
          <input
            className="rounded-xl border border-border/50 bg-background/80 px-3 py-2 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            value={formValues.medication}
            onChange={handleChange('medication')}
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted-foreground">دوز مصرف</span>
          <input
            className="rounded-xl border border-border/50 bg-background/80 px-3 py-2 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            value={formValues.dosage}
            onChange={handleChange('dosage')}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted-foreground">بازه مصرف</span>
          <input
            className="rounded-xl border border-border/50 bg-background/80 px-3 py-2 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            value={formValues.frequency}
            onChange={handleChange('frequency')}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted-foreground">مدت درمان</span>
          <input
            className="rounded-xl border border-border/50 bg-background/80 px-3 py-2 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            value={formValues.duration}
            onChange={handleChange('duration')}
          />
        </label>

        <label className="md:col-span-2 flex flex-col gap-2 text-sm">
          <span className="text-muted-foreground">دستورالعمل تکمیلی</span>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-border/50 bg-background/80 p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            value={formValues.notes}
            onChange={handleChange('notes')}
          />
        </label>

        <div className="md:col-span-2 flex items-center justify-between text-xs text-muted-foreground">
          {errorMessage ? (
            <span className="text-red-500">{errorMessage}</span>
          ) : hasTarget ? (
            <span>نسخه به صورت خودکار به پرونده بیمار افزوده می‌شود.</span>
          ) : (
            <span>برای ثبت نسخه ابتدا یک بیمار یا نوبت را انتخاب کنید.</span>
          )}

          <Button type="submit" disabled={isSubmitting || !formValues.medication.trim() || !hasTarget} size="sm">
            {isSubmitting ? 'در حال ارسال...' : 'ثبت و ارسال نسخه'}
          </Button>
        </div>

        {successMessage && (
          <div className="md:col-span-2 rounded-xl border border-green-400/40 bg-green-50 px-4 py-3 text-xs text-green-700">
            {successMessage}
          </div>
        )}
      </form>
    </section>
  );
};

export default PrescriptionActions;
