'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type ElementType = React.ElementType

export type GlassSurfaceStyleOptions = {
  interactive?: boolean
}

const baseSurfaceClasses = [
  'relative rounded-[2rem] border border-white/50',
  'bg-[linear-gradient(155deg,#FFFFFFD1,#FFFFFF8C)]',
  'shadow-[0_22px_60px_-28px_#2A4A7D73,inset_0_1px_0_#FFFFFFA6,inset_0_-1px_0_#569ADE2E]',
  'backdrop-blur-[20px] backdrop-saturate-[1.5]',
  'transition-[box-shadow,border-color,backdrop-filter,transform] duration-400 ease-glass',
  "before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-white/65 before:bg-[linear-gradient(180deg,#FFFFFFAD_0%,#FFFFFF3D_48%,transparent_100%)] before:content-['']",
  "after:pointer-events-none after:absolute after:inset-[-2px] after:rounded-[inherit] after:bg-[radial-gradient(480px_280px_at_22%_18%,#569ADE38,transparent_58%),radial-gradient(520px_300px_at_78%_72%,#3684D233,transparent_64%)] after:opacity-0 after:transition-[opacity,filter] after:duration-500 after:ease-glass after:content-['']",
  'dark:border-[#78BEFF38] dark:bg-[linear-gradient(150deg,#0C1626EB,#0C1626BD)]',
  'dark:shadow-[0_26px_84px_-32px_#02061CC7,inset_0_1px_0_#78BEFF38,inset_0_-1px_0_#02061CAD]',
  'dark:before:border-[#78BEFF33] dark:before:bg-[linear-gradient(180deg,#78BEFF24_0%,#0C16261F_55%,transparent_100%)]',
  'dark:after:bg-[radial-gradient(520px_320px_at_18%_18%,#2484FF47,transparent_62%),radial-gradient(540px_340px_at_82%_78%,#78BEFF3D,transparent_68%)]',
].join(' ');

const interactiveSurfaceClasses = [
  'hover:backdrop-blur-[24px] hover:backdrop-saturate-[1.7]',
  'hover:shadow-[0_32px_84px_-32px_#2A4A7D8C,inset_0_1px_0_#FFFFFFB3,inset_0_-1px_0_#3684D238,0_18px_45px_#569ADE38,0_0_0_1px_#569ADE3D]',
  'hover:-translate-y-0.5',
  'hover:after:opacity-100 hover:after:[filter:saturate(1.25)]',
  'dark:hover:shadow-[0_36px_110px_-40px_#02061CD1,inset_0_1px_0_#78BEFF42,inset_0_-1px_0_#02061CB8,0_26px_60px_#2484FF47,0_0_0_1px_#78BEFF52]',
].join(' ');


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
