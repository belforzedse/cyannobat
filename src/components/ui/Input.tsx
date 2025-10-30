'use client'

import React, { InputHTMLAttributes, forwardRef, useId } from 'react'
import clsx from 'clsx'

import { FieldShell } from './FieldShell'
import fieldStyles from './FieldShell.module.css'
import inputStyles from './Input.module.css'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

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
      disabled,
      ...props
    },
    ref
  ) => {
    const reactId = useId()
    const generatedId = id || `input-${reactId}`

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
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          disabled={disabled}
        >
          <input
            ref={ref}
            id={generatedId}
            className={clsx(inputStyles.control, className)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            disabled={disabled}
            {...props}
          />
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

Input.displayName = 'Input'

export { Input, type InputProps }
