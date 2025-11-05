'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type ElementType = React.ElementType;

export type GlassPanelVariant = 'default' | 'muted' | 'subtle' | 'accent';
export type GlassPanelState = 'default' | 'active';
export type GlassPanelDensity = 'default' | 'compact';

export interface GlassPanelStyleOptions {
  variant?: GlassPanelVariant;
  state?: GlassPanelState;
  density?: GlassPanelDensity;
}

const basePanelClasses = [
  'relative rounded-[1.5rem] border border-border/3',
  'bg-[linear-gradient(160deg,color-mix(in_srgb,var(--card)_0%,transparent),color-mix(in_srgb,var(--card)_0%,transparent))]',
  'shadow-[6px_10px_20px_-10px_rgba(42,74,125,0.16),_-3px_6px_16px_-14px_rgba(42,74,125,0.12),_0_-10px_32px_-18px_rgba(42,74,125,0.14),_inset_0_0px_1px_rgba(255,255,255,0.5),_inset_0_8px_16px_rgba(255,255,255,0.35),_inset_0_20px_40px_rgba(255,255,255,0.15),_inset_0_40px_80px_rgba(255,255,255,0.05),_inset_20px_20px_40px_rgba(255,255,255,0.12),_inset_-20px_-20px_40px_rgba(255,255,255,0.02)]',
  'backdrop-blur-sm backdrop-saturate-[0.28]',
  'transition-[background-color,border-color,box-shadow,transform] duration-350 ease-glass',
  'text-foreground',
  'dark:shadow-[6px_10px_20px_-10px_rgba(42,74,125,0.16),_-3px_6px_16px_-14px_rgba(42,74,125,0.12),_0_-10px_32px_-18px_rgba(42,74,125,0.14)]',
].join(' ');

const variantClasses: Record<GlassPanelVariant, string> = {
  default: '',
  muted:
    'dark:text-[color:var(--muted-foreground)]',
  subtle:
    '',
  accent: [
    'border-accent/12',
    'text-[color:var(--fg)]',
    'dark:border-accent/5',
    'dark:text-[color:var(--accent-strong)]',
  ].join(' '),
};

const stateClasses: Record<GlassPanelState, string> = {
  default: '',
  active: [
    'border-accent/20 shadow-[0_36px_76px_-34px_rgba(86,154,222,0.22)]',
    '-translate-y-0.5',
    'dark:border-accent/8',
    'dark:shadow-[0_42px_96px_-38px_rgba(75,141,212,0.25)]',
  ].join(' '),
};

const densityClasses: Record<GlassPanelDensity, string> = {
  default: '',
  compact: 'rounded-[1.25rem]',
};

const darkBaseOverrides = [
  'dark:border-transparent',
  'dark:bg-[linear-gradient(160deg,rgba(20,27,40,0),rgba(20,27,40,0))]',
  'dark:shadow-[0_36px_90px_-36px_rgba(10,17,23,0.78)]',
  'dark:backdrop-blur-sm dark:backdrop-saturate-[0.28]',
].join(' ');

export const glassPanelStyles = ({
  variant = 'default',
  state = 'default',
  density = 'default',
}: GlassPanelStyleOptions = {}) =>
  cn(
    basePanelClasses,
    darkBaseOverrides,
    variantClasses[variant],
    stateClasses[state],
    densityClasses[density],
  );

type GlassPanelOwnProps = {
  className?: string;
} & GlassPanelStyleOptions;

type GlassPanelBaseProps = GlassPanelOwnProps & {
  as?: ElementType;
};

export type GlassPanelProps = GlassPanelBaseProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof GlassPanelBaseProps> & {
    [key: string]: unknown;
  };

export const GlassPanel = React.forwardRef<HTMLElement, GlassPanelProps>(
  ({ as, variant, state, density, className, ...props }, ref) => {
    const Component = (as ?? 'div') as ElementType;
    const resolvedVariant = (variant as GlassPanelVariant | undefined) ?? 'default';
    const resolvedState = (state as GlassPanelState | undefined) ?? 'default';
    const resolvedDensity = (density as GlassPanelDensity | undefined) ?? 'default';
    const resolvedClassName = typeof className === 'string' ? className : undefined;

    return (
      <Component
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          glassPanelStyles({
            variant: resolvedVariant,
            state: resolvedState,
            density: resolvedDensity,
          }),
          resolvedClassName,
        )}
        {...(props as object)}
      />
    );
  },
);

GlassPanel.displayName = 'GlassPanel';
