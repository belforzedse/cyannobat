'use client';

import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { liquidSpring } from '@/lib/animation';

interface GlassIconProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /** Lucide icon component to render */
  icon: LucideIcon;
  /** Size variant of the glass icon container */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional label for accessibility */
  label?: string;
  /** Additional className for custom styling */
  className?: string;
  /** Whether to show a glow effect on hover */
  glow?: boolean;
}

const sizeClasses = {
  sm: 'h-11 w-11',
  md: 'h-14 w-14',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
  xl: 'h-9 w-9',
};

/**
 * GlassIcon - Professional glass icon container matching ReactBits design quality
 * Features: Glassmorphism, smooth animations, accessibility support
 */
const GlassIcon = ({
  icon: Icon,
  size = 'md',
  label,
  className,
  glow = true,
  ...motionProps
}: GlassIconProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { scale: 1.08, y: -2 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
      transition={liquidSpring}
      className={clsx(
        'relative flex items-center justify-center',
        // Glass morphism styling - ReactBits inspired
        'rounded-xl',
        'border border-white/18',
        'bg-white/25 dark:bg-white/8',
        'backdrop-filter backdrop-blur-md',
        // Professional shadows
        'shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]',
        'dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]',
        // Smooth transitions
        'transition-all duration-300 ease-out',
        sizeClasses[size],
        className,
      )}
      aria-label={label}
      {...motionProps}
    >
      {/* Top highlight - creates depth */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none"
        aria-hidden
      />

      {/* Inner glow border */}
      <div
        className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none"
        aria-hidden
      />

      {/* Hover glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-accent/30 blur-lg opacity-0 -z-10"
          animate={{ opacity: 0 }}
          whileHover={{ opacity: 0.6 }}
          transition={{ duration: 0.2 }}
          aria-hidden
        />
      )}

      {/* Icon */}
      <Icon
        className={clsx(
          'relative z-10 transition-colors duration-300',
          'text-foreground/80',
          iconSizes[size],
        )}
        aria-hidden
      />
    </motion.div>
  );
};

export default GlassIcon;
