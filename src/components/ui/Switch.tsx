'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'
import React, { forwardRef, useId } from 'react'

import { cn } from '@/lib/utils'

import styles from './Switch/Switch.module.css'

type SwitchTone = 'accent' | 'neutral' | 'muted'
type SwitchSize = 'sm' | 'md' | 'lg'

const toneClassNames: Record<SwitchTone, string> = {
  accent: styles.toneAccent,
  neutral: styles.toneNeutral,
  muted: styles.toneMuted,
}

const sizeClassNames: Record<SwitchSize, string> = {
  sm: styles.sizeSM,
  md: styles.sizeMD,
  lg: styles.sizeLG,
}

interface SwitchProps extends SwitchPrimitive.SwitchProps {
  label?: React.ReactNode
  description?: React.ReactNode
  tone?: SwitchTone
  size?: SwitchSize
  className?: string
  thumbClassName?: string
}

/**
 * CyanNobat toggle switch using Radix primitives for accessibility.
 *
 * @example
 * ```tsx
 * <Switch label="ارسال اعلان" defaultChecked />
 * <Switch label="حالت تاریک" tone="neutral" />
 * <Switch label="به‌روزرسانی خودکار" size="lg" description="دانلود در پس‌زمینه" />
 * ```
 */
const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { label, description, tone = 'accent', size = 'md', id, className, thumbClassName, disabled, ...props },
    ref
  ) => {
    const reactId = useId()
    const switchId = id ?? `switch-${reactId}`
    const descriptionId = description ? `${switchId}-description` : undefined

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
        htmlFor={switchId}
      >
        <SwitchPrimitive.Root
          ref={ref}
          id={switchId}
          className={styles.control}
          disabled={disabled}
          data-disabled={disabled ? 'true' : undefined}
          aria-describedby={descriptionId}
          {...props}
        >
          <SwitchPrimitive.Thumb className={cn(styles.thumb, thumbClassName)} />
        </SwitchPrimitive.Root>

        {(label || description) && (
          <span className={styles.content}>
            {label && <span className={styles.label}>{label}</span>}
            {description && (
              <span id={descriptionId} className={styles.description}>
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch, type SwitchProps, type SwitchSize, type SwitchTone }
