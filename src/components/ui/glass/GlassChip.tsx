'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type ElementType = React.ElementType

export type GlassChipTone = 'default' | 'muted' | 'current' | 'active'
export type GlassChipShape = 'default' | 'circle'

export interface GlassChipStyleOptions {
  tone?: GlassChipTone
  shape?: GlassChipShape
  interactive?: boolean
}

const baseChipClasses = [
  'inline-flex items-center justify-center gap-2 rounded-[1rem] border border-border/45',
  'bg-[linear-gradient(145deg,color-mix(in_srgb,var(--card)_82%,transparent),color-mix(in_srgb,var(--card)_72%,transparent))]',
  'text-[color:var(--fg)]',
  'shadow-[0_16px_32px_-26px_rgba(42,74,125,0.3)]',
  'backdrop-blur-[16px] backdrop-saturate-[1.1]',
  'transition-[background-color,border-color,color,box-shadow,transform] duration-[300ms] ease-glass'
].join(' ')

const toneClasses: Record<GlassChipTone, string> = {
  default: '',
  muted: 'bg-[color-mix(in_srgb,var(--card)_70%,transparent)] text-[color:var(--muted-foreground)] dark:bg-[color-mix(in_srgb,var(--card)_50%,transparent)]',
  current: [
    'border-accent/42',
    'bg-[color-mix(in_srgb,var(--card)_85%,transparent)]',
    'shadow-[0_20px_42px_-30px_rgba(86,154,222,0.36)]'
  ].join(' '),
  active: [
    'border-accent/50',
    'bg-[color-mix(in_srgb,var(--accent)_18%,transparent)]',
    'text-[color:var(--accent-strong)]',
    'shadow-[0_24px_48px_-32px_rgba(86,154,222,0.38)]'
  ].join(' ')
}

const shapeClasses: Record<GlassChipShape, string> = {
  default: 'px-3 py-2 text-sm',
  circle: 'h-9 w-9 rounded-full text-sm'
}

const interactiveClasses = [
  'cursor-pointer',
  'hover:-translate-y-0.5 hover:border-accent/45 hover:shadow-[0_20px_40px_-28px_rgba(86,154,222,0.3)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
].join(' ')

const darkBaseOverrides = [
  'dark:border-border/55',
  'dark:bg-[linear-gradient(150deg,color-mix(in_srgb,var(--card)_70%,transparent),color-mix(in_srgb,var(--card)_58%,transparent))]',
  'dark:text-[color:var(--fg)]',
  'dark:shadow-[0_20px_40px_-28px_rgba(2,6,28,0.7)]'
].join(' ')

const darkToneOverrides: Record<GlassChipTone, string> = {
  default: '',
  muted: 'dark:text-[color:var(--muted-foreground)]',
  current: 'dark:border-accent/45 dark:bg-[color-mix(in_srgb,var(--card)_62%,transparent)] dark:shadow-[0_24px_48px_-30px_rgba(36,132,255,0.32)]',
  active: 'dark:border-accent/50 dark:bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] dark:shadow-[0_30px_56px_-32px_rgba(36,132,255,0.4)]'
}

export const glassChipStyles = ({
  tone = 'default',
  shape = 'default',
  interactive = false
}: GlassChipStyleOptions = {}) =>
  cn(
    baseChipClasses,
    darkBaseOverrides,
    toneClasses[tone],
    darkToneOverrides[tone],
    shapeClasses[shape],
    interactive && interactiveClasses
  )

type GlassChipOwnProps = {
  className?: string
} & GlassChipStyleOptions

type GlassChipBaseProps = GlassChipOwnProps & {
  as?: ElementType
}

export type GlassChipProps = GlassChipBaseProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof GlassChipBaseProps> & {
    [key: string]: unknown
  }

export const GlassChip = React.forwardRef<HTMLElement, GlassChipProps>(
  (
    {
      as,
      tone,
      shape,
      interactive,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Component = (as ?? 'div') as ElementType
    const resolvedTone = (tone as GlassChipTone | undefined) ?? 'default'
    const resolvedShape = (shape as GlassChipShape | undefined) ?? 'default'
    const resolvedInteractive =
      typeof interactive === 'boolean' ? interactive : Boolean(interactive)
    const resolvedClassName =
      typeof className === 'string' ? className : undefined

    return (
      <Component
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          glassChipStyles({
            tone: resolvedTone,
            shape: resolvedShape,
            interactive: resolvedInteractive,
          }),
          resolvedClassName,
        )}
        {...(props as object)}
      >
        {children}
      </Component>
    )
  },
)

GlassChip.displayName = 'GlassChip'
