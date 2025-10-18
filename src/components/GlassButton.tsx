'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import { liquidSpring } from '@/lib/animations';

interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  /** Button content */
  children: React.ReactNode;
  /** Button variant */
  variant?: 'primary' | 'secondary';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

/**
 * GlassButton - Lightweight glass button with CSS-only effects
 * No SVG filters - pure CSS performance
 */
const GlassButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...motionProps
}: GlassButtonProps) => {
  const shouldReduceMotion = useReducedMotion();

  const isPrimary = variant === 'primary';

  return (
    <motion.button
      whileHover={shouldReduceMotion ? undefined : { scale: 1.05, y: -2 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      transition={liquidSpring}
      className={clsx(
        'relative inline-flex items-center justify-center rounded-full font-semibold',
        'border backdrop-blur-md',
        'transition-all duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        sizeStyles[size],
        isPrimary
          ? [
              'border-white/18 bg-gradient-to-br from-accent/30 to-accent/20',
              'text-foreground',
              'shadow-[0_8px_32px_0_rgba(159,221,231,0.25),inset_0_1px_0_0_rgba(255,255,255,0.3)]',
              'hover:shadow-[0_12px_40px_0_rgba(159,221,231,0.35),inset_0_1px_0_0_rgba(255,255,255,0.4)]',
            ]
          : [
              'border-white/18 bg-white/20 dark:bg-white/8',
              'text-foreground/90',
              'shadow-[0_8px_32px_0_rgba(31,38,135,0.15),inset_0_1px_0_0_rgba(255,255,255,0.25)]',
              'hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.2),inset_0_1px_0_0_rgba(255,255,255,0.35)]',
            ],
        className
      )}
      {...motionProps}
    >
      {/* Top highlight */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none"
        aria-hidden
      />

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default GlassButton;
