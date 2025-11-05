'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type ElementType = React.ElementType;

export type GlassSurfaceStyleOptions = {
  interactive?: boolean;
};

const baseSurfaceClasses = [
  'relative rounded-[2rem] border border-white/8',
  'bg-[linear-gradient(155deg,rgba(224,236,249,0.06),rgba(211,230,245,0.03))]',
  'shadow-[8px_12px_24px_-12px_#2A4A7D60,_-4px_8px_20px_-16px_#2A4A7D4A,_inset_0_1px_2px_#E0ECF960,_inset_0_-1px_0_#569ADE32,_0_-12px_40px_-20px_#2A4A7D30]',
  'backdrop-blur-xl backdrop-saturate-[0.3]',
  'transition-[box-shadow,border-color,backdrop-filter,transform] duration-400 ease-glass',
  "before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:bg-[linear-gradient(180deg,rgba(230,242,254,0.3)_0%,rgba(224,236,249,0.18)_12%,rgba(216,230,248,0.08)_30%,rgba(211,223,245,0.02)_55%,transparent_100%),radial-gradient(circle_at_0%_0%,rgba(230,242,254,0.18)_0%,transparent_35%),radial-gradient(circle_at_100%_100%,rgba(224,236,249,0.12)_0%,transparent_45%)] before:border before:border-white/6 before:[mask-image:linear-gradient(180deg,white_0%,rgba(255,255,255,0.85)_25%,rgba(255,255,255,0.4)_65%,transparent_100%)] before:content-['']",
  "after:pointer-events-none after:absolute after:inset-[-2px] after:rounded-[inherit] after:bg-[radial-gradient(480px_280px_at_22%_18%,#569ADE38,transparent_58%),radial-gradient(520px_300px_at_78%_72%,#3684D230,transparent_64%)] after:opacity-0 after:transition-[opacity,filter] after:duration-500 after:ease-glass after:content-['']",
  'dark:border-white/6 dark:bg-[linear-gradient(155deg,rgba(75,141,212,0.08),rgba(75,141,212,0.04))]',
  'dark:shadow-[0_26px_84px_-32px_rgba(5,10,20,0.85),inset_0_1px_0_rgba(75,141,212,0.18),inset_0_-1px_0_rgba(5,10,20,0.45)]',
  'dark:before:border-transparent dark:before:bg-[linear-gradient(180deg,rgba(75,141,212,0.1)_0%,transparent_55%)]',
  'dark:after:bg-[radial-gradient(520px_320px_at_18%_18%,rgba(58,116,190,0.28),transparent_62%),radial-gradient(540px_340px_at_82%_78%,rgba(75,141,212,0.18),transparent_68%)]',
].join(' ');

const interactiveSurfaceClasses = [
  'hover:backdrop-blur-[24px] hover:backdrop-saturate-[1.7]',
  'hover:shadow-[0_32px_84px_-32px_#2A4A7D8C,inset_0_1px_0_#FFFFFFB3,inset_0_-1px_0_#3684D238,0_18px_45px_#569ADE38,0_0_0_1px_#569ADE3D]',
  'hover:-translate-y-0.5',
  'hover:after:opacity-100 hover:after:[filter:saturate(1.25)]',
  'dark:hover:shadow-[0_36px_110px_-40px_#0A1117D8,inset_0_1px_0_#5B8FD840,inset_0_-1px_0_#0A1117B8,0_26px_60px_#3B74BE40,0_0_0_1px_#5B8FD850]',
].join(' ');

export const glassSurfaceStyles = ({ interactive = true }: GlassSurfaceStyleOptions = {}) =>
  cn(baseSurfaceClasses, interactive && interactiveSurfaceClasses);

type GlassSurfaceOwnProps = {
  className?: string;
} & GlassSurfaceStyleOptions;

type GlassSurfaceBaseProps = GlassSurfaceOwnProps & {
  as?: ElementType;
};

export type GlassSurfaceProps = GlassSurfaceBaseProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof GlassSurfaceBaseProps> & {
    [key: string]: unknown;
  };

export const GlassSurface = React.forwardRef<HTMLElement, GlassSurfaceProps>(
  ({ as, interactive, className, ...props }, ref) => {
    const Component = (as ?? 'div') as ElementType;
    const resolvedInteractive =
      typeof interactive === 'boolean' ? interactive : Boolean(interactive);
    const resolvedClassName = typeof className === 'string' ? className : undefined;

    return (
      <Component
        ref={ref as React.Ref<HTMLElement>}
        className={cn(glassSurfaceStyles({ interactive: resolvedInteractive }), resolvedClassName)}
        {...(props as object)}
      />
    );
  },
);

GlassSurface.displayName = 'GlassSurface';
