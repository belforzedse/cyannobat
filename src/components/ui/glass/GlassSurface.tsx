'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type ElementType = React.ElementType

export type GlassSurfaceStyleOptions = {
  interactive?: boolean
}

const baseSurfaceClasses = [
  'relative rounded-[2rem] border border-white/50',
  'bg-[linear-gradient(155deg,rgba(255,255,255,0.82),rgba(255,255,255,0.55))]',
  'shadow-[0_22px_60px_-28px_rgba(42,74,125,0.45),inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-1px_0_rgba(86,154,222,0.18)]',
  'backdrop-blur-[20px] backdrop-saturate-[1.5]',
  'transition-[box-shadow,border-color,backdrop-filter,transform] duration-400 ease-glass',
  "before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-white/65 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.68)_0%,rgba(255,255,255,0.24)_48%,transparent_100%)] before:content-['']",
  "after:pointer-events-none after:absolute after:inset-[-2px] after:rounded-[inherit] after:bg-[radial-gradient(480px_280px_at_22%_18%,rgba(86,154,222,0.22),transparent_58%),radial-gradient(520px_300px_at_78%_72%,rgba(54,132,210,0.2),transparent_64%)] after:opacity-0 after:transition-[opacity,filter] after:duration-500 after:ease-glass after:content-['']",
  'dark:border-[rgba(120,190,255,0.22)] dark:bg-[linear-gradient(150deg,rgba(12,22,38,0.92),rgba(12,22,38,0.74))]',
  'dark:shadow-[0_26px_84px_-32px_rgba(2,6,28,0.78),inset_0_1px_0_rgba(120,190,255,0.22),inset_0_-1px_0_rgba(2,6,28,0.68)]',
  "dark:before:border-[rgba(120,190,255,0.2)] dark:before:bg-[linear-gradient(180deg,rgba(120,190,255,0.14)_0%,rgba(12,22,38,0.12)_55%,transparent_100%)]",
  "dark:after:bg-[radial-gradient(520px_320px_at_18%_18%,rgba(36,132,255,0.28),transparent_62%),radial-gradient(540px_340px_at_82%_78%,rgba(120,190,255,0.24),transparent_68%)]"
].join(' ')

const interactiveSurfaceClasses = [
  'hover:backdrop-blur-[24px] hover:backdrop-saturate-[1.7]',
  'hover:shadow-[0_32px_84px_-32px_rgba(42,74,125,0.55),inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(54,132,210,0.22),0_18px_45px_rgba(86,154,222,0.22),0_0_0_1px_rgba(86,154,222,0.24)]',
  'hover:-translate-y-0.5',
  'hover:after:opacity-100 hover:after:[filter:saturate(1.25)]',
  'dark:hover:shadow-[0_36px_110px_-40px_rgba(2,6,28,0.82),inset_0_1px_0_rgba(120,190,255,0.26),inset_0_-1px_0_rgba(2,6,28,0.72),0_26px_60px_rgba(36,132,255,0.28),0_0_0_1px_rgba(120,190,255,0.32)]'
].join(' ')

export const glassSurfaceStyles = ({ interactive = true }: GlassSurfaceStyleOptions = {}) =>
  cn(baseSurfaceClasses, interactive && interactiveSurfaceClasses)

type GlassSurfaceOwnProps = {
  className?: string
} & GlassSurfaceStyleOptions

type GlassSurfaceBaseProps = GlassSurfaceOwnProps & {
  as?: ElementType
}

export type GlassSurfaceProps = GlassSurfaceBaseProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof GlassSurfaceBaseProps> & {
    [key: string]: unknown
  }

export const GlassSurface = React.forwardRef<HTMLElement, GlassSurfaceProps>(
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
          glassSurfaceStyles({ interactive: resolvedInteractive }),
          resolvedClassName,
        )}
        {...(props as object)}
      />
    )
  },
)

GlassSurface.displayName = 'GlassSurface'
