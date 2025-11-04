'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type ElementType = React.ElementType;

export interface GlassPillStyleOptions {
  interactive?: boolean;
}

const basePillClasses = [
  'inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--pill-border)]',
  'bg-[var(--pill-bg)]',
  'shadow-[var(--pill-shadow)]',
  'backdrop-blur-[var(--pill-backdrop-blur)]',
  'transition-[box-shadow,border-color,background,transform,backdrop-filter] duration-300 ease-glass',
].join(' ');

const interactivePillClasses = [
  'cursor-pointer',
  'hover:border-[color:var(--pill-border-hover)]',
  'hover:bg-[var(--pill-bg-hover)]',
  'hover:shadow-[var(--pill-shadow-hover)]',
  'hover:backdrop-blur-[var(--pill-backdrop-blur-hover)]',
  'hover:-translate-y-0.5',
].join(' ');

export const glassPillStyles = ({ interactive = true }: GlassPillStyleOptions = {}) =>
  cn(basePillClasses, interactive && interactivePillClasses);

type GlassPillOwnProps = {
  className?: string;
} & GlassPillStyleOptions;

type GlassPillBaseProps = GlassPillOwnProps & {
  as?: ElementType;
};

export type GlassPillProps = GlassPillBaseProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof GlassPillBaseProps> & {
    [key: string]: unknown;
  };

export const GlassPill = React.forwardRef<HTMLElement, GlassPillProps>(
  ({ as, interactive, className, ...props }, ref) => {
    const Component = (as ?? 'div') as ElementType;
    const resolvedInteractive =
      typeof interactive === 'boolean' ? interactive : Boolean(interactive);
    const resolvedClassName = typeof className === 'string' ? className : undefined;

    return (
      <Component
        ref={ref as React.Ref<HTMLElement>}
        className={cn(glassPillStyles({ interactive: resolvedInteractive }), resolvedClassName)}
        {...(props as object)}
      />
    );
  },
);

GlassPill.displayName = 'GlassPill';
