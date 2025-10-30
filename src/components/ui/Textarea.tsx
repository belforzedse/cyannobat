'use client'

import { TextareaHTMLAttributes, forwardRef, useEffect, useId, useState } from 'react'
import clsx from 'clsx'

import { FieldShell } from './FieldShell'
import fieldStyles from './FieldShell.module.css'
import textareaStyles from './Textarea.module.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  showCharCount?: boolean
}

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
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(
      typeof value === 'string' ? value.length : 0
    )

    useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length)
      }
    }, [value])

    const reactId = useId()
    const generatedId = id || `textarea-${reactId}`

    const describedBy = error
      ? `${generatedId}-error`
      : helperText
        ? `${generatedId}-helper`
        : undefined

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(event.target.value.length)
      onChange?.(event)
    }

    const valueProps =
      value !== undefined
        ? { value }
        : {}

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

        <FieldShell fullWidth={fullWidth} invalid={Boolean(error)} disabled={disabled}>
          <textarea
            ref={ref}
            id={generatedId}
            className={clsx(textareaStyles.control, className)}
            maxLength={maxLength}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            disabled={disabled}
            onChange={handleChange}
            {...valueProps}
            {...props}
          />
        </FieldShell>

        <div className={fieldStyles.messageRow}>
          <div>
            {error ? (
              <p
                id={`${generatedId}-error`}
                className={clsx(fieldStyles.message, fieldStyles.error)}
              >
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

          {showCharCount && maxLength && (
            <p className={fieldStyles.charCount}>
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
