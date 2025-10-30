'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import React, { ElementRef, forwardRef } from 'react'

import { cn } from '@/lib/utils'

import styles from './Tooltip/Tooltip.module.css'

type TooltipTone = 'muted' | 'accent' | 'inverted'
type TooltipSize = 'sm' | 'md'

const toneClassNames: Record<TooltipTone, string> = {
  muted: styles.toneMuted,
  accent: styles.toneAccent,
  inverted: styles.toneInverted,
}

const arrowToneClassNames: Record<TooltipTone, string> = {
  muted: styles.arrowToneMuted,
  accent: styles.arrowToneAccent,
  inverted: styles.arrowToneInverted,
}

const sizeClassNames: Record<TooltipSize, string> = {
  sm: styles.sizeSM,
  md: styles.sizeMD,
}

interface TooltipContentProps extends TooltipPrimitive.TooltipContentProps {
  tone?: TooltipTone
  size?: TooltipSize
  hideArrow?: boolean
}

type TooltipContentElement = ElementRef<typeof TooltipPrimitive.Content>

const TooltipProvider = TooltipPrimitive.Provider
const TooltipRoot = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = forwardRef<TooltipContentElement, TooltipContentProps>(
  (
    {
      className,
      tone = 'muted',
      size = 'md',
      hideArrow = false,
      sideOffset = 8,
      children,
      ...props
    },
    ref
  ) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        className={cn(styles.content, toneClassNames[tone], sizeClassNames[size], className)}
        sideOffset={sideOffset}
        {...props}
      >
        {children}
        {!hideArrow && (
          <TooltipPrimitive.Arrow className={cn(styles.arrow, arrowToneClassNames[tone])} />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
)

TooltipContent.displayName = 'TooltipContent'

const TooltipArrow = forwardRef<
  ElementRef<typeof TooltipPrimitive.Arrow>,
  TooltipPrimitive.TooltipArrowProps & { tone?: TooltipTone }
>(({ className, tone = 'muted', ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn(styles.arrow, arrowToneClassNames[tone], className)}
    {...props}
  />
))

TooltipArrow.displayName = 'TooltipArrow'

export {
  TooltipProvider,
  TooltipRoot as Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
  type TooltipContentProps,
  type TooltipTone,
  type TooltipSize,
}
