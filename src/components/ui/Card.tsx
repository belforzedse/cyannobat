'use client'

import React, { HTMLAttributes, forwardRef } from 'react'

import { cn } from '@/lib/utils'
import { glassPanelClassName, type GlassPanelVariant } from './glass'

type CardVariant = GlassPanelVariant

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant using shared glass panel styles
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
 * Unified Card component powered by shared glass panel styles
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
    const cardClasses = cn(
      glassPanelClassName(variant),
      paddingClasses[padding],
      animate && 'animate-fade-in-up',
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
