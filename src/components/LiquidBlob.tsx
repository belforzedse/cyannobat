'use client';

import clsx from 'clsx';

import styles from './LiquidBlob.module.css';

interface LiquidBlobProps {
  /** Position from top (percentage or pixels) */
  top?: string;
  /** Position from left (percentage or pixels) */
  left?: string;
  /** Position from right (percentage or pixels) */
  right?: string;
  /** Position from bottom (percentage or pixels) */
  bottom?: string;
  /** Size of the blob */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  variant?: 'primary' | 'accent' | 'muted';
  /** Animation speed multiplier */
  speed?: number;
  /** Additional className */
  className?: string;
}

const sizeClasses = {
  sm: 'h-32 w-32',
  md: 'h-48 w-48',
  lg: 'h-64 w-64',
  xl: 'h-96 w-96',
};

const variantClasses = {
  primary: 'bg-accent/30',
  accent: 'bg-accent-strong/25',
  muted: 'bg-white/20 dark:bg-white/10',
};

/**
 * LiquidBlob - Animated liquid glass blob for background decoration
 * Creates a smooth, morphing blob effect with CSS animations for optimal performance
 */
const LiquidBlob = ({
  top,
  left,
  right,
  bottom,
  size = 'md',
  variant = 'primary',
  speed = 1,
  className,
}: LiquidBlobProps) => {
  const animationDuration = `${20 / speed}s`;

  return (
    <div
      className={clsx(
        'absolute rounded-full blur-3xl pointer-events-none',
        sizeClasses[size],
        variantClasses[variant],
        styles.liquidMorph,
        className
      )}
      style={{
        top,
        left,
        right,
        bottom,
        animationDuration,
      }}
      aria-hidden
    />
  );
};

export default LiquidBlob;
