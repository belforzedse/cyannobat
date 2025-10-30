'use client'

import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { glassPillStyles } from './glass'
import styles from './Button/Button.module.css'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-full font-medium focus-visible:outline-none transition-transform duration-200 ease-out',
  {
    variants: {
      variant: {
        primary: 'overflow-hidden backdrop-blur-[12px]',
        secondary: 'overflow-hidden backdrop-blur-[14px]',
        ghost: 'overflow-hidden backdrop-blur-sm',
        'glass-pill': 'text-foreground',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [
      { variant: 'primary', size: 'sm', class: 'px-6 py-2.5 text-sm' },
      { variant: 'primary', size: 'md', class: 'px-8 py-3 text-base' },
      { variant: 'primary', size: 'lg', class: 'px-10 py-3.5 text-lg' },
      { variant: 'secondary', size: 'sm', class: 'px-4 py-2 text-sm' },
      { variant: 'secondary', size: 'md', class: 'px-6 py-2.5 text-[0.9rem]' },
      { variant: 'secondary', size: 'lg', class: 'px-7 py-3 text-base' },
      { variant: 'glass-pill', size: 'sm', class: 'px-3 py-1.5 text-xs' },
      { variant: 'glass-pill', size: 'md', class: 'px-4 py-2 text-sm' },
      { variant: 'glass-pill', size: 'lg', class: 'px-6 py-3 text-base' },
      { variant: 'ghost', size: 'sm', class: 'px-4 py-2 text-sm' },
      { variant: 'ghost', size: 'md', class: 'px-6 py-2.5 text-sm' },
      { variant: 'ghost', size: 'lg', class: 'px-7 py-3 text-base' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>

const visualVariantClassNames: Partial<Record<ButtonVariant, string>> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
}

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  disableAnimation?: boolean
  className?: string
  whileHover?: HTMLMotionProps<'button'>['whileHover']
  whileTap?: HTMLMotionProps<'button'>['whileTap']
  transition?: HTMLMotionProps<'button'>['transition']
}

/**
 * Unified Button component using Tailwind primitives and GlassPill styling
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Submit</Button>
 * <Button variant="secondary" leftIcon={<Icon />}>Cancel</Button>
 * <Button variant="ghost">Learn more</Button>
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
      whileHover: motionWhileHover,
      whileTap: motionWhileTap,
      transition: motionTransition,
      ...props
    },
    ref
  ) => {
    const isDisabled = Boolean(disabled || isLoading)

    const computedClasses = cn(
      buttonVariants({ variant, size, fullWidth }),
      variant !== 'glass-pill' && styles.root,
      styles.focusVisible,
      variant !== 'glass-pill' && visualVariantClassNames[variant],
      variant === 'glass-pill' && glassPillStyles({ interactive: !isDisabled }),
      isDisabled && styles.disabled,
      className
    )

    const shouldReduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const content = (
      <>
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
      const hoverAnimation =
        variant === 'primary'
          ? { y: -3, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
          : variant === 'secondary'
          ? { y: -2, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
          : variant === 'ghost'
          ? { y: -2, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } }
          : { scale: 1.02, transition: { duration: 0.15, ease: 'easeOut' } }

      const tapAnimation = variant === 'glass-pill'
        ? { scale: 0.98 }
        : { y: 0 }

      return (
        <motion.button
          ref={ref}
          className={computedClasses}
          aria-busy={isLoading || undefined}
          disabled={isDisabled || undefined}
          whileHover={motionWhileHover ?? hoverAnimation}
          whileTap={motionWhileTap ?? tapAnimation}
          transition={motionTransition}
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
        className={computedClasses}
        aria-busy={isLoading || undefined}
        disabled={isDisabled || undefined}
        {...props}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize }
