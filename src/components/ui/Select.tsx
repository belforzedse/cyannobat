'use client'

import { SelectHTMLAttributes, forwardRef, useId } from 'react'
import clsx from 'clsx'

import animations from '../animations.module.css'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
}

/**
 * Unified Select component with consistent glassmorphic styling
 * Consolidates patterns from BookingSelect
 *
 * @example
 * ```tsx
 * <Select
 *   label="انتخاب سرویس"
 *   options={[
 *     { value: '1', label: 'سرویس A' },
 *     { value: '2', label: 'سرویس B' }
 *   ]}
 *   placeholder="یک سرویس انتخاب کنید"
 * />
 * ```
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const reactId = useId()
    const generatedId = id || `select-${reactId}`

    const selectClasses = clsx(
      // Base glass styling (matches Input component)
      'rounded-xl border px-4 py-2.5 text-right text-sm',
      'focus:outline-none focus:ring-2',
      'cursor-pointer appearance-none',
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

      // Placeholder styling
      '[&>option[value=""]]:text-muted-foreground',

      // Error state
      error && 'border-red-400/60 focus:border-red-400 focus:ring-red-400/40',

      // Width
      fullWidth && 'w-full',

      // Padding for icon
      'pr-10',

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
          <select
            ref={ref}
            id={generatedId}
            className={selectClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown icon */}
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

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
    )
  }
)

Select.displayName = 'Select'

export { Select, type SelectProps, type SelectOption }
