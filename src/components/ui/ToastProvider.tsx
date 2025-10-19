'use client'

import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import clsx from 'clsx'

type ToastVariant = 'success' | 'error'

type ToastOptions = {
  title?: string
  description: string
  variant?: ToastVariant
  duration?: number
}

type InternalToast = ToastOptions & { id: number; variant: ToastVariant }

type ToastContextValue = {
  showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<InternalToast[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = Date.now() + Math.random()
      const variant = options.variant ?? 'success'
      const toast: InternalToast = {
        id,
        title: options.title,
        description: options.description,
        variant,
        duration: options.duration ?? 4000,
      }

      setToasts((current) => [...current, toast])

      window.setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    },
    [removeToast],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        <ul className="flex w-full max-w-sm flex-col gap-3">
          {toasts.map((toast) => (
            <li
              key={toast.id}
              className={clsx(
                'pointer-events-auto overflow-hidden rounded-2xl border px-4 py-3 text-right shadow-lg backdrop-blur',
                toast.variant === 'success'
                  ? 'border-emerald-400/40 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                  : 'border-red-400/40 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200',
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-1">
                  {toast.title ? (
                    <p className="text-sm font-semibold text-foreground dark:text-inherit">{toast.title}</p>
                  ) : null}
                  <p className="text-xs text-inherit">{toast.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-xs font-semibold text-inherit opacity-70 transition-opacity hover:opacity-100"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

