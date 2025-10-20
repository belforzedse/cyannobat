'use client'

import { HTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

type ChipVariant = 'default' | 'muted' | 'current' | 'active' | 'circle'

interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant using global .glass-chip classes
   * - default: Standard glass chip
   * - muted: Lighter color (.glass-chip--muted)
   * - current: Current selection state (.glass-chip--current)
   * - active: Active/selected state (.glass-chip--active)
   * - circle: Circular chip (.glass-chip--circle)
   */
  variant?: ChipVariant
  /**
   * Make chip interactive (hover/focus states)
   */
  interactive?: boolean
  /**
   * Optional metadata text (smaller, muted)
   */
  meta?: string
  /**
   * Left icon/element
   */
  leftIcon?: React.ReactNode
  /**
   * Right icon/element
   */
  rightIcon?: React.ReactNode
}

/**
 * Unified Chip component using global .glass-chip classes
 * Used for tags, time slots, status indicators, etc.
 *
 * @example
 * ```tsx
 * <Chip variant="default" interactive>10:00</Chip>
 * <Chip variant="active">انتخاب شده</Chip>
 * <Chip variant="circle" meta="5">A</Chip>
 * ```
 */
const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      variant = 'default',
      interactive = false,
      meta,
      leftIcon,
      rightIcon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const chipClasses = clsx(
      // Base glass-chip class from globals.css
      'glass-chip',

      // Variant modifiers
      variant === 'muted' && 'glass-chip--muted',
      variant === 'current' && 'glass-chip--current',
      variant === 'active' && 'glass-chip--active',
      variant === 'circle' && 'glass-chip--circle',

      // Interactive state
      interactive && 'glass-chip--interactive cursor-pointer',

      // Layout
      'inline-flex items-center justify-center gap-2',
      variant !== 'circle' && 'px-3 py-2 text-sm',

      // Custom overrides
      className
    )

    return (
      <div ref={ref} className={chipClasses} {...props}>
        {leftIcon && <span className="inline-flex">{leftIcon}</span>}
        <span className="inline-flex flex-col items-center gap-0.5">
          {children}
          {meta && <span className="glass-chip__meta">{meta}</span>}
        </span>
        {rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </div>
    )
  }
)

Chip.displayName = 'Chip'

export { Chip, type ChipProps, type ChipVariant }
