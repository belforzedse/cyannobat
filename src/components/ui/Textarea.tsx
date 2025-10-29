'use client'

import { TextareaHTMLAttributes, forwardRef, useState, useId } from 'react'
import clsx from 'clsx'

import animations from '../animations.module.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  showCharCount?: boolean
  maxLength?: number
}

/**
 * Unified Textarea component with consistent glassmorphic styling
 * Replaces the 60+ inline classes in ContactSection
 *
 * @example
 * ```tsx
 * <Textarea label="توضیحات" rows={4} />
 * <Textarea maxLength={500} showCharCount />
 * ```
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      showCharCount = false,
      maxLength,
      className,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(
      typeof value === 'string' ? value.length : 0
    )

    const reactId = useId()
    const generatedId = id || `textarea-${reactId}`

    const textareaClasses = clsx(
      // Base glass styling (matches Input component)
      'min-h-[100px] rounded-xl border px-4 py-3 text-right text-sm',
      'placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2',
      'resize-y',
      // Smooth, slow transitions for all properties
      'transition-all duration-300 ease-out',

      // Light mode
      'border-white/20 bg-white/50',
      'hover:border-white/30 hover:bg-white/60',
      'focus:border-accent focus:bg-white/70 focus:ring-accent/40',

      // Dark mode
      'dark:border-white/12 dark:bg-white/10',
      'dark:hover:border-white/20 dark:hover:bg-white/15',
      'dark:focus:border-accent/50 dark:focus:bg-white/20',

      // Text color
      'text-foreground',

      // Error state
      error && 'border-red-400/60 focus:border-red-400 focus:ring-red-400/40',

      // Width
      fullWidth && 'w-full',

      // Custom overrides
      className
    )

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      props.onChange?.(e)
    }

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={generatedId}
            className="text-right text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={generatedId}
          className={textareaClasses}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined
          }
          {...props}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            {error && (
              <p
                id={`${generatedId}-error`}
                className={clsx(animations.fadeIn, 'text-right text-xs text-red-500')}
              >
                {error}
              </p>
            )}

            {!error && helperText && (
              <p
                id={`${generatedId}-helper`}
                className="text-right text-xs text-muted-foreground"
              >
                {helperText}
              </p>
            )}
          </div>

          {showCharCount && maxLength && (
            <p className="text-left text-xs text-muted-foreground">
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea, type TextareaProps }
