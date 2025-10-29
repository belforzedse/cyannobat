'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type ElementType = React.ElementType

type PolymorphicComponentProps<T extends ElementType, Props> = Props & {
  as?: T
} & Omit<React.ComponentPropsWithoutRef<T>, keyof Props | 'as'>

export type GlassPanelVariant = 'default' | 'muted' | 'subtle' | 'accent'
export type GlassPanelState = 'default' | 'active'
export type GlassPanelDensity = 'default' | 'compact'

export interface GlassPanelStyleOptions {
  variant?: GlassPanelVariant
  state?: GlassPanelState
  density?: GlassPanelDensity
}

const basePanelClasses = [
  'relative rounded-[1.5rem] border border-[rgb(var(--border-rgb)/0.45)]',
  'bg-[linear-gradient(160deg,rgba(var(--card-rgb),0.9),rgba(var(--card-rgb),0.75))]',
  'shadow-[0_28px_70px_-32px_rgba(42,74,125,0.42)]',
  'backdrop-blur-[24px] backdrop-saturate-[1.35]',
  'transition-[background-color,border-color,box-shadow,transform] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
  'text-foreground'
].join(' ')

const variantClasses: Record<GlassPanelVariant, string> = {
  default: '',
  muted: 'bg-[linear-gradient(160deg,rgba(var(--card-rgb),0.82),rgba(var(--card-rgb),0.68))] dark:bg-[linear-gradient(160deg,rgba(var(--card-rgb),0.82),rgba(var(--card-rgb),0.65))] dark:text-[color:var(--muted-foreground)]',
  subtle: 'bg-[rgba(var(--card-rgb),0.7)] dark:bg-[rgba(var(--card-rgb),0.6)]',
  accent: [
    'border-[rgb(var(--accent-rgb)/0.55)]',
    'bg-[linear-gradient(165deg,rgba(var(--accent-rgb),0.22),rgba(var(--card-rgb),0.78))]',
    'text-[color:var(--fg)]',
    'dark:bg-[linear-gradient(170deg,rgba(var(--accent-rgb),0.22),rgba(var(--card-rgb),0.74))]',
    'dark:text-[color:var(--accent-strong)]'
  ].join(' ')
}

const stateClasses: Record<GlassPanelState, string> = {
  default: '',
  active: [
    'border-[rgb(var(--accent-rgb)/0.4)] shadow-[0_36px_76px_-34px_rgba(86,154,222,0.32)]',
    '-translate-y-0.5',
    'dark:border-[rgb(var(--accent-rgb)/0.5)]',
    'dark:shadow-[0_42px_96px_-38px_rgba(36,132,255,0.4)]'
  ].join(' ')
}

const densityClasses: Record<GlassPanelDensity, string> = {
  default: '',
  compact: 'rounded-[1.25rem]'
}

const darkBaseOverrides = [
  'dark:border-[rgb(var(--border-rgb)/0.6)]',
  'dark:bg-[linear-gradient(160deg,rgba(var(--card-rgb),0.9),rgba(var(--card-rgb),0.72))]',
  'dark:shadow-[0_36px_90px_-36px_rgba(2,6,28,0.78)]'
].join(' ')

export const glassPanelStyles = ({
  variant = 'default',
  state = 'default',
  density = 'default'
}: GlassPanelStyleOptions = {}) =>
  cn(basePanelClasses, darkBaseOverrides, variantClasses[variant], stateClasses[state], densityClasses[density])

type GlassPanelOwnProps = {
  className?: string
} & GlassPanelStyleOptions

export type GlassPanelProps<T extends ElementType = 'div'> = PolymorphicComponentProps<T, GlassPanelOwnProps>

type GlassPanelComponent = <T extends ElementType = 'div'>(
  props: GlassPanelProps<T> & {
    ref?: React.ComponentPropsWithRef<T>['ref']
  }
) => React.ReactElement | null

export const GlassPanel = React.forwardRef(function GlassPanel<T extends ElementType = 'div'>(
  { as, variant = 'default', state = 'default', density = 'default', className, ...props }: GlassPanelProps<T>,
  ref: React.ComponentPropsWithRef<T>['ref']
) {
  const Component = (as ?? 'div') as ElementType

  return (
    <Component
      ref={ref}
      className={cn(glassPanelStyles({ variant, state, density }), className)}
      {...(props as object)}
    />
  )
}) as GlassPanelComponent

GlassPanel.displayName = 'GlassPanel'
