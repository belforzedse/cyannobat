'use client'

import { SelectHTMLAttributes, forwardRef, useId } from 'react'
import clsx from 'clsx'

import { FieldShell } from './FieldShell'
import fieldStyles from './FieldShell.module.css'
import selectStyles from './Select.module.css'

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

const ChevronDown = () => (
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
)

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
      disabled,
      ...props
    },
    ref
  ) => {
    const reactId = useId()
    const generatedId = id || `select-${reactId}`

    const describedBy = error
      ? `${generatedId}-error`
      : helperText
        ? `${generatedId}-helper`
        : undefined

    return (
      <div
        className={clsx(
          fieldStyles.fieldGroup,
          fullWidth && fieldStyles.fieldGroupFullWidth
        )}
      >
        {label && (
          <label htmlFor={generatedId} className={fieldStyles.label}>
            {label}
          </label>
        )}

        <FieldShell
          fullWidth={fullWidth}
          invalid={Boolean(error)}
          leftIcon={<ChevronDown />}
          disabled={disabled}
        >
          <select
            ref={ref}
            id={generatedId}
            className={clsx(selectStyles.control, className)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            disabled={disabled}
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
        </FieldShell>

        {error ? (
          <p id={`${generatedId}-error`} className={clsx(fieldStyles.message, fieldStyles.error)}>
            {error}
          </p>
        ) : helperText ? (
          <p
            id={`${generatedId}-helper`}
            className={clsx(fieldStyles.message, fieldStyles.helper)}
          >
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select, type SelectProps, type SelectOption }
