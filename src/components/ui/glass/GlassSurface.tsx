'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type ElementType = React.ElementType;

export type GlassSurfaceStyleOptions = {
  interactive?: boolean;
};

const baseSurfaceClasses = [
  'relative isolate overflow-hidden rounded-[var(--radius-glass)] border border-[color:var(--glass-surface-border)]',
  'bg-[var(--glass-surface-bg)]',
  'shadow-[var(--glass-surface-shadow)]',
  'backdrop-blur-[var(--glass-surface-backdrop-blur)]',
  'backdrop-saturate-[var(--glass-surface-backdrop-saturation)]',
  'transition-[box-shadow,border-color,background,backdrop-filter,transform] duration-400 ease-glass',
  "before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:rounded-[inherit] before:border before:border-[color:var(--glass-surface-border-inner)] before:bg-[var(--glass-surface-highlight)] before:transition-[border-color,background] before:duration-400 before:ease-glass before:content-['']",
  "after:pointer-events-none after:absolute after:inset-[-2px] after:-z-[1] after:rounded-[inherit] after:bg-[var(--glass-surface-glow)] after:opacity-0 after:transition-[opacity,filter] after:duration-500 after:ease-glass after:content-[''] after:[filter:saturate(var(--glass-surface-glow-saturation))]",
].join(' ');

const interactiveSurfaceClasses = [
  'hover:border-[color:var(--glass-surface-border-hover)]',
  'hover:bg-[var(--glass-surface-bg-hover)]',
  'hover:before:border-[color:var(--glass-surface-border-inner-hover)]',
  'hover:before:bg-[var(--glass-surface-highlight-hover)]',
  'hover:backdrop-blur-[var(--glass-surface-backdrop-blur-hover)] hover:backdrop-saturate-[var(--glass-surface-backdrop-saturation-hover)]',
  'hover:shadow-[var(--glass-surface-shadow-hover)]',
  'hover:-translate-y-0.5',
  'hover:after:opacity-100 hover:after:[filter:saturate(var(--glass-surface-glow-saturation-hover))]',
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
