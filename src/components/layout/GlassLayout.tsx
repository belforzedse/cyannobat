'use client';

import type { ReactNode } from 'react';
import { GlassSurface } from '@/components/ui/glass';
import clsx from 'clsx';

export interface GlassLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * GlassLayoutWrapper - Main content wrapper with glass styling
 * Applies shared glass effects, rounded borders, gradient background, shadow, and dark-mode tweaks
 */
export const GlassLayoutWrapper = ({ children, className }: GlassLayoutProps) => {
  return (
    <GlassSurface
      as="div"
      interactive={false}
      className={clsx(
        'relative min-h-screen w-full',
        'rounded-none lg:rounded-3xl',
        className,
      )}
    >
      {children}
    </GlassSurface>
  );
};

/**
 * GlassContentArea - Content area wrapper with glass styling
 * Used for main content sections within the layout
 */
export const GlassContentArea = ({ children, className }: GlassLayoutProps) => {
  return (
    <GlassSurface
      as="section"
      interactive={false}
      className={clsx(
        'relative overflow-hidden rounded-2xl',
        'border border-white/20 dark:border-white/10',
        'shadow-lg',
        className,
      )}
    >
      {children}
    </GlassSurface>
  );
};

/**
 * GlassBackdropBlur - Decorative background blur effect
 * Creates liquid glass glow effects for the layout
 */
export const GlassBackdropBlur = ({
  top,
  left,
  right,
  bottom,
  variant = 'primary',
  size = 'lg',
  className,
}: {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  variant?: 'primary' | 'accent' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) => {
  const variantClasses = {
    primary: 'bg-accent/45 dark:bg-accent/30',
    accent: 'bg-accent-strong/28 dark:bg-accent-strong/35',
    muted: 'bg-white/20 dark:bg-white/10',
  };

  const sizeClasses = {
    sm: 'h-[16rem] w-[16rem]',
    md: 'h-[20rem] w-[20rem]',
    lg: 'h-[26rem] w-[26rem]',
    xl: 'h-[32rem] w-[32rem]',
  };

  return (
    <div
      className={clsx(
        'pointer-events-none fixed -z-20 rounded-full blur-3xl',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      style={{ top, left, right, bottom }}
      aria-hidden
    />
  );
};

/**
 * GlassHeaderDivider - Decorative gradient divider
 * Creates a subtle horizontal line with gradient effect
 */
export const GlassHeaderDivider = ({ className }: { className?: string }) => {
  return (
    <div
      className={clsx(
        'pointer-events-none absolute inset-x-8 top-6 -z-10 h-px',
        'bg-gradient-to-r from-transparent via-white/60 to-transparent',
        'opacity-60 dark:via-white/15',
        className,
      )}
      aria-hidden
    />
  );
};
