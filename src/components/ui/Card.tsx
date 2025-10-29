'use client'

import React, { HTMLAttributes, forwardRef } from 'react'

import { GlassPanel, type GlassPanelDensity, type GlassPanelVariant } from './glass'
import { cn } from '@/lib/utils'
import animations from '../animations.module.css'

type CardVariant = 'default' | 'muted' | 'subtle' | 'active' | 'accent' | 'compact'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant mapped to the GlassPanel primitive
   * - default: Standard glass panel
   * - muted: More transparent surface
   * - subtle: Very transparent surface
   * - active: Accent border emphasis
   * - accent: Accent background treatment
   * - compact: Smaller border radius
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
 * Unified Card component built on the GlassPanel primitive
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
    const panelVariant: GlassPanelVariant =
      variant === 'muted' || variant === 'subtle' || variant === 'accent'
        ? variant
        : 'default'
    const panelState = variant === 'active' ? 'active' : 'default'
    const panelDensity: GlassPanelDensity = variant === 'compact' ? 'compact' : 'default'

    return (
      <GlassPanel
        ref={ref}
        variant={panelVariant}
        state={panelState}
        density={panelDensity}
        className={cn(paddingClasses[padding], animate && animations.fadeInUp, className)}
        {...props}
      >
        {children}
      </GlassPanel>
    )
  }
)

Card.displayName = 'Card'

export { Card, type CardProps, type CardVariant }
