'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type ElementType = React.ElementType

type PolymorphicComponentProps<T extends ElementType, Props> = Props & {
  as?: T
} & Omit<React.ComponentPropsWithoutRef<T>, keyof Props | 'as'>

export interface GlassPillStyleOptions {
  interactive?: boolean
}

const basePillClasses = [
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/45',
  'bg-[linear-gradient(145deg,rgba(255,255,255,0.7),rgba(255,255,255,0.4))]',
  'shadow-[0_14px_32px_-22px_rgba(42,74,125,0.38),inset_0_1px_0_rgba(255,255,255,0.6)]',
  'backdrop-blur-[16px]',
  'transition-[box-shadow,border-color,background,transform] duration-[250ms] ease-glass'
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

export type GlassPillProps<T extends ElementType = 'div'> = PolymorphicComponentProps<T, GlassPillOwnProps>

type GlassPillComponent = <T extends ElementType = 'div'>(
  props: GlassPillProps<T> & {
    ref?: React.ComponentPropsWithRef<T>['ref']
  }
) => React.ReactElement | null

export const GlassPill = React.forwardRef(function GlassPill<T extends ElementType = 'div'>(
  { as, interactive = true, className, ...props }: GlassPillProps<T>,
  ref: React.ComponentPropsWithRef<T>['ref']
) {
  const Component = (as ?? 'div') as ElementType

  return (
    <Component
      ref={ref}
      className={cn(glassPillStyles({ interactive }), className)}
      {...(props as object)}
    />
  )
}) as GlassPillComponent

GlassPill.displayName = 'GlassPill'
