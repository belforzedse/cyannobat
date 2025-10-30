'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import clsx from 'clsx'

import styles from './ToastProvider.module.css'

const DEFAULT_DURATION = 4000

export type ToastVariant = 'success' | 'error' | 'info'

export type ToastAction = {
  label: string
  onClick: () => void
  dismissOnAction?: boolean
}

export type ToastOptions = {
  title?: string
  description: string
  variant?: ToastVariant
  duration?: number
  action?: ToastAction
}

type InternalToast = {
  id: number
  title?: string
  description: string
  variant: ToastVariant
  duration: number
  action?: ToastAction
}

type ToastContextValue = {
  showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<InternalToast[]>([])
  const timeoutHandlesRef = useRef<Map<number, number>>(new Map())

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timeoutHandle = timeoutHandlesRef.current.get(id)
    if (timeoutHandle !== undefined) {
      window.clearTimeout(timeoutHandle)
      timeoutHandlesRef.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = Date.now() + Math.random()
      const variant = options.variant ?? 'success'
      const duration = options.duration ?? DEFAULT_DURATION
      const toast: InternalToast = {
        id,
        title: options.title,
        description: options.description,
        variant,
        duration,
        action: options.action,
      }

      setToasts((current) => [...current, toast])

      if (Number.isFinite(duration)) {
        const handle = window.setTimeout(() => {
          removeToast(id)
        }, duration)
        timeoutHandlesRef.current.set(id, handle)
      }
    },
    [removeToast],
  )

  const handleAction = useCallback(
    (toast: InternalToast) => {
      toast.action?.onClick()
      if (toast.action?.dismissOnAction !== false) {
        removeToast(toast.id)
      }
    },
    [removeToast],
  )

  useEffect(() => {
    const timeoutHandles = timeoutHandlesRef.current
    return () => {
      timeoutHandles.forEach((timeoutHandle) => {
        window.clearTimeout(timeoutHandle)
      })
      timeoutHandles.clear()
    }
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.viewport} role='presentation'>
        <ul className={styles.stack}>
          {toasts.map((toast) => {
            const role = toast.variant === 'error' ? 'alert' : 'status'
            const live = toast.variant === 'error' ? 'assertive' : 'polite'
            const titleId = toast.title ? `toast-${toast.id}-title` : undefined
            const descriptionId = `toast-${toast.id}-description`
            return (
              <li
                key={toast.id}
                role={role}
                aria-live={live}
                aria-atomic='true'
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className={clsx(styles.toast, styles[toast.variant])}
              >
                <div className={styles.content}>
                  <div className={styles.copy}>
                    {toast.title ? (
                      <p id={titleId} className={styles.title}>
                        {toast.title}
                      </p>
                    ) : null}
                    <p id={descriptionId} className={styles.description}>
                      {toast.description}
                    </p>
                  </div>
                  <div className={styles.actions}>
                    {toast.action ? (
                      <button
                        type='button'
                        className={styles.actionButton}
                        onClick={() => handleAction(toast)}
                      >
                        {toast.action.label}
                      </button>
                    ) : null}
                    <button
                      type='button'
                      className={styles.dismissButton}
                      onClick={() => removeToast(toast.id)}
                      aria-label='بستن اعلان'
                    >
                      ×
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
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

