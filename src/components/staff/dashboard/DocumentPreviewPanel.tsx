'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/Button';

export type DocumentPreview = {
  id: string;
  filename: string;
  url: string;
  mimeType?: string | null;
  uploadedAt?: string | null;
  description?: string | null;
};

export type DocumentPreviewPanelProps = {
  patientId?: string;
  appointmentId?: string;
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
};

export const DocumentPreviewPanel = ({ patientId, appointmentId }: DocumentPreviewPanelProps) => {
  const [documents, setDocuments] = useState<DocumentPreview[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selected = useMemo(
    () => documents.find((doc) => doc.id === activeId) ?? documents[0] ?? null,
    [activeId, documents],
  );

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (patientId) params.set('patientId', patientId);
    if (appointmentId) params.set('appointmentId', appointmentId);

    try {
      const response = await fetch(`/api/staff/documents?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? 'Failed to load documents');
      }

      const payload = (await response.json()) as { documents?: DocumentPreview[] };
      const docs = Array.isArray(payload.documents) ? payload.documents : [];
      setDocuments(docs);
      if (docs.length > 0) {
        setActiveId(docs[0].id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'در دریافت پرونده‌ها مشکلی پیش آمد';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, patientId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground">مرور پرونده‌ها</h3>
        <p className="text-sm text-muted-foreground">نمایش و دانلود سریع اسناد و فایل‌های پیوست شده.</p>
      </header>

      {error && <div className="rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-xs text-red-600">{error}</div>}

      <div className="grid gap-4 md:grid-cols-[240px,1fr]">
        <aside className="space-y-2">
          {isLoading && <div className="text-xs text-muted-foreground">در حال بارگذاری...</div>}
          {!isLoading && documents.length === 0 && (
            <div className="text-sm text-muted-foreground">سندی بارگذاری نشده است.</div>
          )}

          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(doc.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-right text-xs transition ${
                    selected?.id === doc.id
                      ? 'border-accent/60 bg-accent/15 text-accent font-medium'
                      : 'border-border/40 bg-background/80 text-foreground hover:border-accent/40'
                  }`}
                >
                  <div className="font-medium">{doc.filename}</div>
                  <div className="text-[11px] text-muted-foreground">{formatDate(doc.uploadedAt)}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex h-full flex-col gap-3 rounded-xl border border-border/40 bg-background/80 p-4">
          {selected ? (
            <>
              <header className="space-y-1">
                <h4 className="text-base font-medium text-foreground">{selected.filename}</h4>
                <p className="text-xs text-muted-foreground">
                  نوع فایل: {selected.mimeType ?? 'نامشخص'} · بارگذاری: {formatDate(selected.uploadedAt)}
                </p>
              </header>
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div className="rounded-lg border border-dashed border-border/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                  پیش‌نمایش در دسترس نیست. برای مشاهده کامل روی دکمه زیر کلیک کنید.
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      window.open(selected.url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    مشاهده/دانلود
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              سندی برای نمایش انتخاب نشده است.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DocumentPreviewPanel;
