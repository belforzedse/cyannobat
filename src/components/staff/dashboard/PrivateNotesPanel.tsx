'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/Button';

export type PrivateNote = {
  id: string;
  content: string;
  createdAt: string;
  appointmentId?: string | null;
  authorName?: string | null;
};

export type PrivateNotesPanelProps = {
  patientId?: string;
  appointmentId?: string;
};

const formatDateTime = (value: string) => {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export const PrivateNotesPanel = ({ patientId, appointmentId }: PrivateNotesPanelProps) => {
  const [notes, setNotes] = useState<PrivateNote[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (patientId) params.set('patientId', patientId);
    if (appointmentId) params.set('appointmentId', appointmentId);
    return params;
  }, [patientId, appointmentId]);

  const loadNotes = useCallback(async () => {
    const response = await fetch(`/api/staff/notes?${queryParams.toString()}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message ?? 'Failed to load private notes');
    }

    const payload = (await response.json()) as { notes?: PrivateNote[] };
    setNotes(Array.isArray(payload.notes) ? payload.notes : []);
  }, [queryParams]);

  useEffect(() => {
    loadNotes().catch((err) => {
      setError(err instanceof Error ? err.message : 'خطا در دریافت یادداشت‌ها');
    });
  }, [loadNotes]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      if (!noteContent.trim()) return;

      setIsSaving(true);

      try {
        const response = await fetch('/api/staff/notes', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: noteContent,
            patientId: patientId ?? null,
            appointmentId: appointmentId ?? null,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error((body as { message?: string }).message ?? 'Failed to save note');
        }

        setNoteContent('');
        await loadNotes();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'ذخیره‌سازی یادداشت ناموفق بود';
        setError(message);
      } finally {
        setIsSaving(false);
      }
    },
    [appointmentId, loadNotes, noteContent, patientId],
  );

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground">یادداشت‌های خصوصی</h3>
        <p className="text-sm text-muted-foreground">
          ثبت و مرور یادداشت‌های فقط-پزشک برای پیگیری‌های آینده.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          className="w-full rounded-xl border border-border/50 bg-background/80 p-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          rows={4}
          placeholder="یادداشت خصوصی جدید..."
          value={noteContent}
          onChange={(event) => setNoteContent(event.target.value)}
        />

        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          {error ? <span className="text-red-500">{error}</span> : <span>این یادداشت فقط برای تیم درمانی قابل مشاهده است.</span>}

          <Button type="submit" disabled={isSaving || !noteContent.trim()} size="sm">
            {isSaving ? 'در حال ذخیره...' : 'ثبت یادداشت'}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {notes.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">یادداشتی ثبت نشده است.</div>
        )}

        {notes.map((note) => (
          <article
            key={note.id}
            className="space-y-1 rounded-xl border border-border/40 bg-background/80 p-4"
          >
            <p className="text-sm text-foreground">{note.content}</p>
            <footer className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDateTime(note.createdAt)}</span>
              {note.authorName ? <span>· {note.authorName}</span> : null}
              {note.appointmentId ? <span>· نوبت #{note.appointmentId}</span> : null}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PrivateNotesPanel;
