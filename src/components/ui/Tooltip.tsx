'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import React, { CSSProperties, ElementRef, forwardRef } from 'react'

import { cn } from '@/lib/utils'

type TooltipTone = 'muted' | 'accent' | 'inverted'
type TooltipSize = 'sm' | 'md'

const tooltipToneStyles: Record<TooltipTone, CSSProperties> = {
  muted: { '--tooltip-bg': 'color-mix(in srgb, var(--muted) 82%, transparent)', '--tooltip-border': 'rgba(var(--muted-foreground-rgb, 78 94 120), 0.5)', '--tooltip-color': 'rgba(var(--fg-rgb), 0.92)' } as CSSProperties,
  accent: { '--tooltip-bg': 'linear-gradient(145deg, color-mix(in srgb, var(--accent-strong) 88%, white 8%), color-mix(in srgb, var(--accent) 92%, white 6%))', '--tooltip-border': 'rgba(var(--accent-rgb), 0.55)', '--tooltip-color': 'var(--accent-foreground, rgb(var(--fg-rgb)))', boxShadow: '0 22px 48px -24px rgba(var(--accent-rgb), 0.4)' } as CSSProperties,
  inverted: { '--tooltip-bg': 'rgba(15, 23, 42, 0.92)', '--tooltip-border': 'rgba(255, 255, 255, 0.1)', '--tooltip-color': 'rgba(248, 250, 252, 0.95)', boxShadow: '0 22px 42px -24px rgba(2, 6, 23, 0.7)' } as CSSProperties,
}

const arrowToneStyles: Record<TooltipTone, CSSProperties> = {
  muted: { fill: 'color-mix(in srgb, var(--muted) 84%, white 6%)', stroke: 'rgba(var(--muted-foreground-rgb, 78 94 120), 0.5)' } as CSSProperties,
  accent: { fill: 'color-mix(in srgb, var(--accent) 88%, white 10%)', stroke: 'rgba(var(--accent-rgb), 0.55)' } as CSSProperties,
  inverted: { fill: 'rgba(15, 23, 42, 0.92)', stroke: 'rgba(255, 255, 255, 0.08)' } as CSSProperties,
}

const sizeClassNames: Record<TooltipSize, string> = {
  sm: '[--tooltip-padding-y:0.35rem] [--tooltip-padding-x:0.55rem] text-[0.78rem]',
  md: '[--tooltip-padding-y:0.45rem] [--tooltip-padding-x:0.7rem] text-[0.85rem]',
}

const sideAnimationClass: Record<
  NonNullable<TooltipPrimitive.TooltipContentProps['side']>,
  string
> = {
  top: 'animate-tooltip-slide-down',
  bottom: 'animate-tooltip-slide-up',
  left: 'animate-tooltip-slide-right',
  right: 'animate-tooltip-slide-left',
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
      side = 'top',
      children,
      ...props
    },
    ref
  ) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        className={cn(
          '[--tooltip-padding-y:0.45rem] [--tooltip-padding-x:0.65rem]',
          'rounded-[calc(var(--radius-sm)/1.4)] border border-[var(--tooltip-border)] bg-[var(--tooltip-bg)] text-[var(--tooltip-color)] font-medium leading-[1.45]',
          'px-[var(--tooltip-padding-x)] py-[var(--tooltip-padding-y)] backdrop-blur-[12px] backdrop-saturate-[1.2]',
          'transition-transform duration-200 ease-glass',
          sizeClassNames[size],
          sideAnimationClass[side],
          className
        )}
        style={tooltipToneStyles[tone]}
        sideOffset={sideOffset}
        side={side}
        {...props}
      >
        {children}
        {!hideArrow && (
          <TooltipPrimitive.Arrow style={{ width: '14px', height: '6px', ...arrowToneStyles[tone] }} />
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
    style={{ width: '14px', height: '6px', ...arrowToneStyles[tone] }}
    className={className}
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
