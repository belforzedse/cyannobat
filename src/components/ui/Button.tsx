'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'glass-pill'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  disableAnimation?: boolean
  className?: string
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

/**
 * Unified Button component using global glass classes from globals.css
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Submit</Button>
 * <Button variant="secondary" leftIcon={<Icon />}>Cancel</Button>
 * <Button variant="glass-pill" isLoading>Loading...</Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disableAnimation = false,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = clsx(
      // Use global classes from globals.css
      variant === 'primary' && 'btn-primary',
      variant === 'secondary' && 'btn-secondary',
      variant === 'glass-pill' && 'glass-pill inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium cursor-pointer',

      // Size overrides for glass-pill (primary/secondary have fixed sizes in globals.css)
      variant === 'glass-pill' && sizeClasses[size],

      // Utility classes
      fullWidth && 'w-full',
      (disabled || isLoading) && 'pointer-events-none',

      // Custom additions
      className
    )

    const shouldReduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const content = (
      <>
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </>
    )

    // Use Framer Motion for smooth hover/tap interactions
    // Primary/secondary use CSS transform but Framer adds smoothness
    if (!disableAnimation && !shouldReduceMotion) {
      const hoverAnimation = variant === 'primary'
        ? { y: -3, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
        : variant === 'secondary'
        ? { y: -2, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
        : { scale: 1.02, transition: { duration: 0.15, ease: 'easeOut' } }

      const tapAnimation = variant === 'glass-pill'
        ? { scale: 0.98 }
        : { y: 0 }

      return (
        <motion.button
          ref={ref}
          className={baseClasses}
          disabled={disabled || isLoading}
          whileHover={hoverAnimation}
          whileTap={tapAnimation}
          {...(props as HTMLMotionProps<'button'>)}
        >
          {content}
        </motion.button>
      )
    }

    // Fallback for reduced motion preference
    return (
      <button
        ref={ref}
        className={baseClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize }
