'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type ElementType = React.ElementType

export interface GlassPillStyleOptions {
  interactive?: boolean
}

const basePillClasses = [
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/45',
  'bg-[linear-gradient(145deg,rgba(255,255,255,0.7),rgba(255,255,255,0.4))]',
  'shadow-[0_14px_32px_-22px_rgba(42,74,125,0.38),inset_0_1px_0_rgba(255,255,255,0.6)]',
  'backdrop-blur-[16px]',
  'transition-[box-shadow,border-color,background,transform] duration-250 ease-glass'
].join(' ')

const interactivePillClasses = [
  'cursor-pointer',
  'hover:border-accent/40',
  'hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.78),color-mix(in_srgb,var(--accent)_18%,transparent))]',
  'hover:shadow-[0_22px_42px_-26px_rgba(86,154,222,0.32),0_12px_30px_-20px_rgba(42,74,125,0.32)]',
  'hover:-translate-y-0.5'
].join(' ')

const darkBaseOverrides = [
  'dark:border-[rgba(120,190,255,0.25)]',
  'dark:bg-[linear-gradient(145deg,rgba(12,22,38,0.88),rgba(12,22,38,0.64))]',
  'dark:shadow-[0_18px_42px_-26px_rgba(2,6,28,0.72),inset_0_1px_0_rgba(120,190,255,0.16)]'
].join(' ')

const darkInteractiveOverrides = [
  'dark:hover:border-[rgba(120,190,255,0.5)]',
  'dark:hover:bg-[linear-gradient(145deg,rgba(36,132,255,0.22),rgba(12,22,38,0.76))]',
  'dark:hover:shadow-[0_28px_52px_-28px_rgba(36,132,255,0.35),0_18px_36px_-26px_rgba(2,6,28,0.68)]'
].join(' ')

export const glassPillStyles = ({ interactive = true }: GlassPillStyleOptions = {}) =>
  cn(
    basePillClasses,
    darkBaseOverrides,
    interactive && [interactivePillClasses, darkInteractiveOverrides]
  )

type GlassPillOwnProps = {
  className?: string
} & GlassPillStyleOptions

type GlassPillBaseProps = GlassPillOwnProps & {
  as?: ElementType
}

export type GlassPillProps = GlassPillBaseProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof GlassPillBaseProps> & {
    [key: string]: unknown
  }

export const GlassPill = React.forwardRef<HTMLElement, GlassPillProps>(
  (
    { as, interactive, className, ...props },
    ref,
  ) => {
    const Component = (as ?? 'div') as ElementType
    const resolvedInteractive =
      typeof interactive === 'boolean' ? interactive : Boolean(interactive)
    const resolvedClassName =
      typeof className === 'string' ? className : undefined

    return (
      <Component
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          glassPillStyles({ interactive: resolvedInteractive }),
          resolvedClassName,
        )}
        {...(props as object)}
      />
    )
  },
)

GlassPill.displayName = 'GlassPill'
