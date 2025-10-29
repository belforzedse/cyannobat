'use client'

import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { glassPillStyles } from './glass'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-full focus-visible:outline-none',
  {
    variants: {
      variant: {
        primary:
          'cursor-pointer overflow-hidden border border-[rgba(255,255,255,0.55)] bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] font-semibold text-[rgb(12,22,38)] shadow-[0_20px_48px_-24px_rgba(86,154,222,0.45),0_10px_18px_-16px_rgba(42,74,125,0.28)] backdrop-blur-[12px] transition-[box-shadow,transform,filter] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] after:content-[""] after:absolute after:inset-[2px] after:rounded-full after:bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.2)_58%,transparent_100%)] after:pointer-events-none after:opacity-[0.85] after:transition-opacity after:duration-[250ms] after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] hover:after:opacity-100 hover:shadow-[0_28px_60px_-24px_rgba(86,154,222,0.55),0_16px_24px_-18px_rgba(42,74,125,0.34)] active:translate-y-0 active:brightness-[0.98] disabled:cursor-not-allowed disabled:opacity-75 disabled:shadow-none disabled:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_55%,transparent),color-mix(in_srgb,var(--accent)_35%,transparent))] disabled:after:opacity-[0.5] dark:text-[rgb(4,10,24)] dark:shadow-[0_24px_56px_-26px_rgba(36,132,255,0.55),0_12px_28px_-18px_rgba(2,6,28,0.6)] dark:hover:shadow-[0_32px_68px_-28px_rgba(120,190,255,0.6),0_18px_36px_-20px_rgba(2,6,28,0.65)] dark:disabled:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_42%,transparent),color-mix(in_srgb,var(--accent)_24%,transparent))] dark:after:opacity-[0.85]',
        secondary:
          'cursor-pointer overflow-hidden border border-[rgba(255,255,255,0.45)] bg-[linear-gradient(145deg,rgba(255,255,255,0.68),rgba(255,255,255,0.4))] text-foreground shadow-[0_16px_36px_-24px_rgba(42,74,125,0.28),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-[14px] transition-[border-color,background,box-shadow,transform] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] after:content-[""] after:absolute after:inset-[2px] after:rounded-full after:bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.12)_65%,transparent_100%)] after:pointer-events-none after:opacity-[0.75] after:transition-opacity after:duration-[220ms] after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] hover:border-accent/45 hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.72),color-mix(in_srgb,var(--accent)_16%,transparent))] hover:shadow-[0_20px_44px_-26px_rgba(86,154,222,0.32),inset_0_1px_0_rgba(255,255,255,0.6)] hover:after:opacity-[0.9] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:after:opacity-40 dark:border-[rgba(120,190,255,0.28)] dark:bg-[linear-gradient(145deg,rgba(12,22,38,0.85),rgba(12,22,38,0.62))] dark:shadow-[0_22px_48px_-28px_rgba(2,6,28,0.72),inset_0_1px_0_rgba(120,190,255,0.18)] dark:hover:border-[rgba(120,190,255,0.5)] dark:hover:bg-[linear-gradient(145deg,rgba(36,132,255,0.18),rgba(12,22,38,0.78))] dark:hover:shadow-[0_30px_58px_-30px_rgba(36,132,255,0.32),inset_0_1px_0_rgba(120,190,255,0.22)] dark:disabled:border-[rgba(120,190,255,0.16)] dark:disabled:bg-[linear-gradient(145deg,rgba(12,22,38,0.7),rgba(12,22,38,0.5))]',
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
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>

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
      variant === 'glass-pill' && glassPillStyles({ interactive: !isDisabled }),
      isDisabled && 'pointer-events-none',
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
          className={computedClasses}
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
