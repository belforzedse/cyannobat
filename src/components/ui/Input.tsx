'use client'

import { InputHTMLAttributes, forwardRef, useState, useId } from 'react'
import clsx from 'clsx'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

/**
 * Unified Input component with consistent glassmorphic styling
 * Consolidates patterns from BookingInput and ContactSection
 *
 * @example
 * ```tsx
 * <Input label="نام" placeholder="نام خود را وارد کنید" />
 * <Input type="email" error="ایمیل نامعتبر است" />
 * <Input leftIcon={<SearchIcon />} />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)

    const reactId = useId()
    const generatedId = id || `input-${reactId}`

    const inputClasses = clsx(
      // Base glass styling (consistent across all inputs)
      'rounded-xl border px-4 py-2.5 text-right text-sm',
      'placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2',
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

      // Icon padding
      leftIcon && 'pr-10',
      rightIcon && 'pl-10',

      // Width
      fullWidth && 'w-full',

      // Custom overrides
      className
    )

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

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={generatedId}
            className={inputClasses}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${generatedId}-error`}
            className="animate-fade-in text-right text-xs text-red-500"
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
    )
  }
)

Input.displayName = 'Input'

export { Input, type InputProps }
