'use client'

import React, { HTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

type CardVariant = 'default' | 'muted' | 'subtle' | 'active' | 'accent' | 'compact'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant using global .glass-panel classes
   * - default: Standard glass panel
   * - muted: More transparent (.glass-panel--muted)
   * - subtle: Very transparent (.glass-panel--subtle)
   * - active: Accent border (.glass-panel--active)
   * - accent: Accent background (.glass-panel--accent)
   * - compact: Smaller border radius (.glass-panel--compact)
   */
  variant?: CardVariant
  /**
   * Apply custom animation on mount
   */
  animate?: boolean
  /**
   * Padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses: Record<Exclude<CardProps['padding'], undefined>, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

/**
 * Unified Card component using global .glass-panel classes
 * Replaces custom inline card styling across components
 *
 * @example
 * ```tsx
 * <Card variant="default" padding="md">
 *   <h3>عنوان کارت</h3>
 *   <p>محتوای کارت</p>
 * </Card>
 *
 * <Card variant="accent" animate>
 *   <p>کارت با بک‌گراند رنگی</p>
 * </Card>
 * ```
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      animate = false,
      padding = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const cardClasses = clsx(
      // Base glass-panel class from globals.css
      'glass-panel',

      // Variant modifiers (also from globals.css)
      variant === 'muted' && 'glass-panel--muted',
      variant === 'subtle' && 'glass-panel--subtle',
      variant === 'active' && 'glass-panel--active',
      variant === 'accent' && 'glass-panel--accent',
      variant === 'compact' && 'glass-panel--compact',

      // Padding
      paddingClasses[padding],

      // Animation (use CSS animation from globals.css)
      animate && 'animate-fade-in-up',

      // Custom overrides
      className
    )

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card, type CardProps, type CardVariant }
