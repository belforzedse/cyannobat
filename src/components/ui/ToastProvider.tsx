'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const DEFAULT_DURATION = 4000;

const toastVariantStyles: Record<'success' | 'error' | 'info', CSSProperties> = {
  success: {
    '--toast-border': 'rgba(var(--status-success-rgb), 0.45)',
    '--toast-foreground': 'color-mix(in srgb, var(--status-success) 70%, var(--fg) 30%)',
    '--toast-action-color':
      'color-mix(in srgb, var(--status-success) 65%, var(--toast-foreground) 35%)',
    backgroundImage:
      'linear-gradient(145deg, color-mix(in srgb, rgba(var(--status-success-rgb), 0.12) 60%, var(--card) 40%), color-mix(in srgb, rgba(var(--status-success-rgb), 0.2) 45%, transparent))',
  } as CSSProperties,
  error: {
    '--toast-border': 'rgba(var(--status-error-rgb), 0.45)',
    '--toast-foreground': 'color-mix(in srgb, var(--status-error) 72%, var(--fg) 28%)',
    '--toast-action-color':
      'color-mix(in srgb, var(--status-error) 65%, var(--toast-foreground) 35%)',
    backgroundImage:
      'linear-gradient(145deg, color-mix(in srgb, rgba(var(--status-error-rgb), 0.12) 60%, var(--card) 40%), color-mix(in srgb, rgba(var(--status-error-rgb), 0.2) 45%, transparent))',
  } as CSSProperties,
  info: {
    '--toast-border': 'rgba(var(--status-info-rgb), 0.45)',
    '--toast-foreground': 'color-mix(in srgb, var(--status-info) 70%, var(--fg) 30%)',
    '--toast-action-color':
      'color-mix(in srgb, var(--status-info) 60%, var(--toast-foreground) 40%)',
    backgroundImage:
      'linear-gradient(145deg, color-mix(in srgb, rgba(var(--status-info-rgb), 0.12) 60%, var(--card) 40%), color-mix(in srgb, rgba(var(--status-info-rgb), 0.2) 45%, transparent))',
  } as CSSProperties,
};

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastAction = {
  label: string;
  onClick: () => void;
  dismissOnAction?: boolean;
};

export type ToastOptions = {
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
};

type InternalToast = {
  id: number;
  title?: string;
  description: string;
  variant: ToastVariant;
  duration: number;
  action?: ToastAction;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<InternalToast[]>([]);
  const timeoutHandlesRef = useRef<Map<number, number>>(new Map());

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeoutHandle = timeoutHandlesRef.current.get(id);
    if (timeoutHandle !== undefined) {
      window.clearTimeout(timeoutHandle);
      timeoutHandlesRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = Date.now() + Math.random();
      const variant = options.variant ?? 'success';
      const duration = options.duration ?? DEFAULT_DURATION;
      const toast: InternalToast = {
        id,
        title: options.title,
        description: options.description,
        variant,
        duration,
        action: options.action,
      };

      setToasts((current) => [...current, toast]);

      if (Number.isFinite(duration)) {
        const handle = window.setTimeout(() => {
          removeToast(id);
        }, duration);
        timeoutHandlesRef.current.set(id, handle);
      }
    },
    [removeToast],
  );

  const handleAction = useCallback(
    (toast: InternalToast) => {
      toast.action?.onClick();
      if (toast.action?.dismissOnAction !== false) {
        removeToast(toast.id);
      }
    },
    [removeToast],
  );

  useEffect(() => {
    const timeoutHandles = timeoutHandlesRef.current;
    return () => {
      timeoutHandles.forEach((timeoutHandle) => {
        window.clearTimeout(timeoutHandle);
      });
      timeoutHandles.clear();
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
        role="presentation"
      >
        <ul className="flex flex-col gap-3 w-full max-w-sm">
          {toasts.map((toast) => {
            const role = toast.variant === 'error' ? 'alert' : 'status';
            const live = toast.variant === 'error' ? 'assertive' : 'polite';
            const titleId = toast.title ? `toast-${toast.id}-title` : undefined;
            const descriptionId = `toast-${toast.id}-description`;
            return (
              <li
                key={toast.id}
                role={role}
                aria-live={live}
                aria-atomic="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className="pointer-events-auto list-none rounded-lg border border-solid bg-card shadow-glass-soft backdrop-blur-sm px-4 py-3.5 text-right flex flex-col gap-2 animate-toast-enter"
                style={{ direction: 'rtl', ...toastVariantStyles[toast.variant] }}
              >
                <div className="flex gap-3 items-start">
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    {toast.title ? (
                      <p id={titleId} className="m-0 text-sm font-semibold text-current">
                        {toast.title}
                      </p>
                    ) : null}
                    <p
                      id={descriptionId}
                      className="m-0 text-xs leading-6"
                      style={{ color: 'currentColor', opacity: 0.82 }}
                    >
                      {toast.description}
                    </p>
                  </div>
                  <div className="flex flex-row gap-2 items-start">
                    {toast.action ? (
                      <button
                        type="button"
                        className="border-none bg-none text-xs font-semibold p-0 cursor-pointer transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-ring"
                        onClick={() => handleAction(toast)}
                      >
                        {toast.action.label}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="border-none bg-none text-xs font-semibold p-0 cursor-pointer opacity-70 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-ring focus-visible:rounded-full"
                      onClick={() => removeToast(toast.id)}
                      aria-label="بستن اعلان"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
