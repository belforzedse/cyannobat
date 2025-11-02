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
  'relative rounded-[1.5rem] border border-border/45',
  'bg-[linear-gradient(160deg,color-mix(in_srgb,var(--card)_90%,transparent),color-mix(in_srgb,var(--card)_75%,transparent))]',
  'shadow-[0_28px_70px_-32px_rgba(42,74,125,0.42)]',
  'backdrop-blur-[24px] backdrop-saturate-[1.35]',
  'transition-[background-color,border-color,box-shadow,transform] duration-350 ease-glass',
  'text-foreground',
].join(' ');

const variantClasses: Record<GlassPanelVariant, string> = {
  default: '',
  muted:
    'bg-[linear-gradient(160deg,color-mix(in_srgb,var(--card)_82%,transparent),color-mix(in_srgb,var(--card)_68%,transparent))] dark:bg-[linear-gradient(160deg,color-mix(in_srgb,var(--card)_82%,transparent),color-mix(in_srgb,var(--card)_65%,transparent))] dark:text-[color:var(--muted-foreground)]',
  subtle:
    'bg-[color-mix(in_srgb,var(--card)_70%,transparent)] dark:bg-[color-mix(in_srgb,var(--card)_60%,transparent)]',
  accent: [
    'border-accent/55',
    'bg-[linear-gradient(165deg,color-mix(in_srgb,var(--accent)_22%,transparent),color-mix(in_srgb,var(--card)_78%,transparent))]',
    'text-[color:var(--fg)]',
    'dark:bg-[linear-gradient(170deg,color-mix(in_srgb,var(--accent)_22%,transparent),color-mix(in_srgb,var(--card)_74%,transparent))]',
    'dark:text-[color:var(--accent-strong)]',
  ].join(' '),
};

const stateClasses: Record<GlassPanelState, string> = {
  default: '',
  active: [
    'border-accent/40 shadow-[0_36px_76px_-34px_rgba(86,154,222,0.32)]',
    '-translate-y-0.5',
    'dark:border-accent/50',
    'dark:shadow-[0_42px_96px_-38px_rgba(36,132,255,0.4)]',
  ].join(' '),
};

const densityClasses: Record<GlassPanelDensity, string> = {
  default: '',
  compact: 'rounded-[1.25rem]',
};

const darkBaseOverrides = [
  'dark:border-border/60',
  'dark:bg-[linear-gradient(160deg,color-mix(in_srgb,var(--card)_90%,transparent),color-mix(in_srgb,var(--card)_72%,transparent))]',
  'dark:shadow-[0_36px_90px_-36px_rgba(2,6,28,0.78)]',
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
