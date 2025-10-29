'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type ElementType = React.ElementType

type PolymorphicComponentProps<T extends ElementType, Props> = Props & {
  as?: T
} & Omit<React.ComponentPropsWithoutRef<T>, keyof Props | 'as'>

export type GlassChipTone = 'default' | 'muted' | 'current' | 'active'
export type GlassChipShape = 'default' | 'circle'

export interface GlassChipStyleOptions {
  tone?: GlassChipTone
  shape?: GlassChipShape
  interactive?: boolean
}

const baseChipClasses = [
  'inline-flex items-center justify-center gap-2 rounded-[1rem] border border-[rgb(var(--border-rgb)/0.45)]',
  'bg-[linear-gradient(145deg,rgba(var(--card-rgb),0.82),rgba(var(--card-rgb),0.72))]',
  'text-[color:var(--fg)]',
  'shadow-[0_16px_32px_-26px_rgba(42,74,125,0.3)]',
  'backdrop-blur-[16px] backdrop-saturate-[1.1]',
  'transition-[background-color,border-color,color,box-shadow,transform] duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)]'
].join(' ')

const toneClasses: Record<GlassChipTone, string> = {
  default: '',
  muted: 'bg-[rgba(var(--card-rgb),0.7)] text-[color:var(--muted-foreground)] dark:bg-[rgba(var(--card-rgb),0.5)]',
  current: [
    'border-[rgb(var(--accent-rgb)/0.42)]',
    'bg-[rgba(var(--card-rgb),0.85)]',
    'shadow-[0_20px_42px_-30px_rgba(86,154,222,0.36)]'
  ].join(' '),
  active: [
    'border-[rgb(var(--accent-rgb)/0.5)]',
    'bg-[rgba(var(--accent-rgb),0.18)]',
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
  'hover:-translate-y-0.5 hover:border-[rgb(var(--accent-rgb)/0.45)] hover:shadow-[0_20px_40px_-28px_rgba(86,154,222,0.3)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-rgb),0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background'
].join(' ')

const darkBaseOverrides = [
  'dark:border-[rgb(var(--border-rgb)/0.55)]',
  'dark:bg-[linear-gradient(150deg,rgba(var(--card-rgb),0.7),rgba(var(--card-rgb),0.58))]',
  'dark:text-[color:var(--fg)]',
  'dark:shadow-[0_20px_40px_-28px_rgba(2,6,28,0.7)]'
].join(' ')

const darkToneOverrides: Record<GlassChipTone, string> = {
  default: '',
  muted: 'dark:text-[color:var(--muted-foreground)]',
  current: 'dark:border-[rgb(var(--accent-rgb)/0.45)] dark:bg-[rgba(var(--card-rgb),0.62)] dark:shadow-[0_24px_48px_-30px_rgba(36,132,255,0.32)]',
  active: 'dark:border-[rgb(var(--accent-rgb)/0.5)] dark:bg-[rgba(var(--accent-rgb),0.22)] dark:shadow-[0_30px_56px_-32px_rgba(36,132,255,0.4)]'
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

export type GlassChipProps<T extends ElementType = 'div'> = PolymorphicComponentProps<T, GlassChipOwnProps>

type GlassChipComponent = <T extends ElementType = 'div'>(
  props: GlassChipProps<T> & {
    ref?: React.ComponentPropsWithRef<T>['ref']
  }
) => React.ReactElement | null

export const GlassChip = React.forwardRef(function GlassChip<T extends ElementType = 'div'>({
  as,
  tone = 'default',
  shape = 'default',
  interactive = false,
  className,
  children,
  ...props
}: GlassChipProps<T>, ref: React.ComponentPropsWithRef<T>['ref']) {
  const Component = (as ?? 'div') as ElementType

  return (
    <Component
      ref={ref}
      className={cn(glassChipStyles({ tone, shape, interactive }), className)}
      {...(props as object)}
    >
      {children}
    </Component>
  )
}) as GlassChipComponent

GlassChip.displayName = 'GlassChip'
