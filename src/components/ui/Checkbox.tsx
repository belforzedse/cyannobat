'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import React, { forwardRef, useId } from 'react'

import { cn } from '@/lib/utils'

import styles from './Checkbox/Checkbox.module.css'

type CheckboxTone = 'accent' | 'neutral' | 'muted'
type CheckboxSize = 'sm' | 'md' | 'lg'

const toneClassNames: Record<CheckboxTone, string> = {
  accent: styles.toneAccent,
  neutral: styles.toneNeutral,
  muted: styles.toneMuted,
}

const sizeClassNames: Record<CheckboxSize, string> = {
  sm: styles.sizeSM,
  md: styles.sizeMD,
  lg: styles.sizeLG,
}

interface CheckboxProps extends Omit<CheckboxPrimitive.CheckboxProps, 'children'> {
  label?: React.ReactNode
  description?: React.ReactNode
  tone?: CheckboxTone
  size?: CheckboxSize
  helperText?: React.ReactNode
  className?: string
  controlClassName?: string
}

/**
 * Accessible checkbox built on top of Radix primitives.
 * Styled with CyanNobat design tokens for predictable glassmorphic visuals.
 *
 * @example
 * ```tsx
 * <Checkbox label="قوانین را می‌پذیرم" defaultChecked />
 * <Checkbox label="اعلان‌ها" tone="muted" description="ارسال اعلان‌های ایمیل" />
 * <Checkbox label="حریم خصوصی" tone="neutral" size="sm" />
 * ```
 */
const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      label,
      description,
      helperText,
      tone = 'accent',
      size = 'md',
      id,
      className,
      controlClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const reactId = useId()
    const checkboxId = id ?? `checkbox-${reactId}`
    const descriptionId = description ? `${checkboxId}-description` : undefined
    const helperId = helperText ? `${checkboxId}-helper` : undefined
    const describedBy = [descriptionId, helperId].filter(Boolean).join(' ') || undefined

    return (
      <label
        className={cn(
          styles.wrapper,
          toneClassNames[tone],
          sizeClassNames[size],
          disabled && styles.isDisabled,
          className
        )}
        data-disabled={disabled ? 'true' : undefined}
        htmlFor={checkboxId}
      >
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          className={cn(styles.control, controlClassName)}
          disabled={disabled}
          data-disabled={disabled ? 'true' : undefined}
          aria-describedby={describedBy}
          {...props}
        >
          <CheckboxPrimitive.Indicator className={styles.indicator}>
            <Check aria-hidden className={cn(styles.icon, styles.checkIcon)} />
            <Minus aria-hidden className={cn(styles.icon, styles.indeterminateIcon)} />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {(label || description || helperText) && (
          <span className={styles.content}>
            {label && <span className={styles.label}>{label}</span>}
            {description && (
              <span id={descriptionId} className={styles.description}>
                {description}
              </span>
            )}
            {helperText && (
              <span id={helperId} className={styles.helper}>
                {helperText}
              </span>
            )}
          </span>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox, type CheckboxProps, type CheckboxTone, type CheckboxSize }
