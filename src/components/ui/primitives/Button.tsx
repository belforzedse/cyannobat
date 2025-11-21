'use client';

import React, { ButtonHTMLAttributes, CSSProperties, forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import { glassPillStyles } from '@/components/ui/glass';

const buttonToneStyles = {
  primary: {
    '--button-border': 'color-mix(in srgb, var(--accent) 55%, transparent)',
    '--button-border-hover': 'color-mix(in srgb, var(--accent) 65%, transparent)',
    '--button-bg': 'linear-gradient(135deg, var(--accent-strong), var(--accent))',
    '--button-bg-hover':
      'linear-gradient(135deg, color-mix(in srgb, var(--accent-strong) 82%, white 12%), color-mix(in srgb, var(--accent) 90%, white 8%))',
    '--button-color': 'rgb(12 22 38)',
    '--button-shadow':
      '0 20px 48px -24px rgb(var(--accent-rgb) / 0.45), 0 12px 24px -18px rgba(42, 74, 125, 0.32)',
    '--button-shadow-hover':
      '0 28px 60px -24px rgb(var(--accent-rgb) / 0.55), 0 16px 32px -20px rgba(42, 74, 125, 0.38)',
    '--button-translate-hover': '-1.5px',
  } as CSSProperties,
  secondary: {
    '--button-border': 'rgba(var(--border-rgb), 0.65)',
    '--button-border-hover': 'color-mix(in srgb, var(--accent) 35%, rgba(var(--border-rgb), 0.65))',
    '--button-bg': 'linear-gradient(145deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.4))',
    '--button-bg-hover':
      'linear-gradient(145deg, rgba(255, 255, 255, 0.78), color-mix(in srgb, var(--accent) 16%, transparent))',
    '--button-color': 'rgb(var(--fg-rgb))',
    '--button-shadow': 'var(--shadow-glass-soft)',
    '--button-shadow-hover': 'var(--shadow-glass-strong)',
    '--button-translate-hover': '-1px',
  } as CSSProperties,
  ghost: {
    '--button-border': 'rgba(var(--accent-rgb), 0.35)',
    '--button-border-hover': 'rgba(var(--accent-rgb), 0.55)',
    '--button-bg': 'transparent',
    '--button-bg-hover': 'rgba(var(--accent-rgb), 0.12)',
    '--button-color': 'rgb(var(--accent-rgb))',
    '--button-shadow': 'none',
    '--button-shadow-hover': '0 16px 32px -24px rgba(var(--accent-rgb), 0.24)',
    '--button-translate-hover': '-0.75px',
  } as CSSProperties,
};

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-pill font-medium focus-visible:outline-none transition-transform duration-200 ease-glass',
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
  },
);

type ButtonVariantsConfig = VariantProps<typeof buttonVariants>;
type ButtonVariant = NonNullable<ButtonVariantsConfig['variant']>;
type ButtonSize = NonNullable<ButtonVariantsConfig['size']>;

const gradientButtonBaseClasses = [
  '[--button-border:transparent] [--button-border-hover:transparent] [--button-bg:transparent] [--button-bg-hover:transparent]',
  '[--button-color:rgb(var(--fg-rgb))] [--button-shadow:none] [--button-shadow-hover:none] [--button-translate-hover:-1px] [--button-translate-active:0]',
  'relative overflow-hidden border border-[var(--button-border)] bg-[var(--button-bg)] text-[var(--button-color)] shadow-[var(--button-shadow,none)]',
  'transition-[background,box-shadow,border-color,transform,filter] duration-200 ease-glass',
  "after:pointer-events-none after:absolute after:inset-[2px] after:rounded-[inherit] after:content-['']",
  'after:bg-[linear-gradient(180deg,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.2)_60%,rgba(255,255,255,0)_100%)]',
  'after:opacity-0 after:transition-opacity after:duration-200 after:ease-glass',
  'hover:border-[var(--button-border-hover)] hover:bg-[var(--button-bg-hover)] hover:shadow-[var(--button-shadow-hover)] hover:after:opacity-100',
  'hover:-translate-y-[var(--button-translate-hover)] active:translate-y-[var(--button-translate-active,0)]',
  'focus-visible:shadow-[0_0_0_3px_rgb(var(--ring-rgb)/0.45),var(--button-shadow,0_0_0_0_transparent)] focus-visible:after:opacity-100',
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70 disabled:[filter:saturate(0.85)] disabled:after:opacity-40',
].join(' ');

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disableAnimation?: boolean;
  className?: string;
  whileHover?: HTMLMotionProps<'button'>['whileHover'];
  whileTap?: HTMLMotionProps<'button'>['whileTap'];
  transition?: HTMLMotionProps<'button'>['transition'];
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
    ref,
  ) => {
    const isDisabled = Boolean(disabled || isLoading);

    const computedClasses = cn(
      buttonVariants({ variant, size, fullWidth }),
      variant !== 'glass-pill' && gradientButtonBaseClasses,
      variant === 'glass-pill' && glassPillStyles({ interactive: !isDisabled }),
      className,
    );

    const buttonStyle =
      variant !== 'glass-pill'
        ? buttonToneStyles[variant as keyof typeof buttonToneStyles]
        : undefined;

    const shouldReduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    );

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
              : { scale: 1.02, transition: { duration: 0.15, ease: 'easeOut' } };

      const tapAnimation = variant === 'glass-pill' ? { scale: 0.98 } : { y: 0 };

      return (
        <motion.button
          ref={ref}
          className={computedClasses}
          style={buttonStyle}
          aria-busy={isLoading || undefined}
          disabled={isDisabled || undefined}
          whileHover={motionWhileHover ?? hoverAnimation}
          whileTap={motionWhileTap ?? tapAnimation}
          transition={motionTransition}
          {...(props as HTMLMotionProps<'button'>)}
        >
          {content}
        </motion.button>
      );
    }

    // Fallback for reduced motion preference
    return (
      <button
        ref={ref}
        className={computedClasses}
        style={buttonStyle}
        aria-busy={isLoading || undefined}
        disabled={isDisabled || undefined}
        {...props}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
