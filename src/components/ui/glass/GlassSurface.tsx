'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type ElementType = React.ElementType;

export type GlassSurfaceStyleOptions = {
  interactive?: boolean;
};

const baseSurfaceClasses = [
  'relative rounded-[2rem] border border-white/30',
  'bg-[linear-gradient(155deg,rgba(255,255,255,0.6),rgba(255,255,255,0.56))]',
  'shadow-[0_22px_60px_-28px_#2A4A7D73,inset_0_1px_0_#FFFFFFA6,inset_0_-1px_0_#569ADE2E]',
  'backdrop-blur-[20px] backdrop-saturate-[1.5]',
  'transition-[box-shadow,border-color,backdrop-filter,transform] duration-400 ease-glass',
  "before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-white/35 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.2)_48%,transparent_100%)] before:content-['']",
  "after:pointer-events-none after:absolute after:inset-[-2px] after:rounded-[inherit] after:bg-[radial-gradient(480px_280px_at_22%_18%,#569ADE38,transparent_58%),radial-gradient(520px_300px_at_78%_72%,#3684D233,transparent_64%)] after:opacity-0 after:transition-[opacity,filter] after:duration-500 after:ease-glass after:content-['']",
  'dark:border-white/12 dark:bg-[linear-gradient(150deg,#141B28E8,#141B28B8)]',
  'dark:shadow-[0_26px_84px_-32px_#0A1117C0,inset_0_1px_0_#5B8FD838,inset_0_-1px_0_#0A1117A8]',
  'dark:before:border-white/10 dark:before:bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(20,27,40,0.1)_55%,transparent_100%)]',
  'dark:after:bg-[radial-gradient(520px_320px_at_18%_18%,#3B74BE40,transparent_62%),radial-gradient(540px_340px_at_82%_78%,#5B8FD835,transparent_68%)]',
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
