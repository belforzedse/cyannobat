'use client';

import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

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
 * Creates a smooth, morphing blob effect with liquid motion
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
  const shouldReduceMotion = useReducedMotion();

  const animationDuration = (20 / speed);

  return (
    <motion.div
      className={clsx(
        'absolute rounded-full blur-3xl pointer-events-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      style={{ top, left, right, bottom }}
      animate={
        shouldReduceMotion
          ? {}
          : {
              x: [0, 30, -20, 40, 0],
              y: [0, -40, 30, -20, 0],
              scale: [1, 1.1, 0.95, 1.05, 1],
              rotate: [0, 10, -5, 15, 0],
            }
      }
      transition={{
        duration: animationDuration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      aria-hidden
    />
  );
};

export default LiquidBlob;
