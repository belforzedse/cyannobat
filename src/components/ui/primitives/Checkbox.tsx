'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import React, { CSSProperties, forwardRef, useId } from 'react';

import { cn } from '@/lib/utils';

type CheckboxTone = 'accent' | 'neutral' | 'muted';
type CheckboxSize = 'sm' | 'md' | 'lg';

const checkboxToneStyles = {
  accent: {
    '--checkbox-border': 'rgba(var(--accent-rgb), 0.45)',
    '--checkbox-border-hover': 'rgba(var(--accent-rgb), 0.65)',
    '--checkbox-border-active': 'rgba(var(--accent-rgb), 0.75)',
    '--checkbox-bg': 'color-mix(in srgb, var(--accent) 18%, var(--card))',
    '--checkbox-bg-hover': 'color-mix(in srgb, var(--accent) 24%, var(--card))',
    '--checkbox-bg-checked':
      'linear-gradient(145deg, color-mix(in srgb, var(--accent-strong) 85%, white 12%), color-mix(in srgb, var(--accent) 92%, white 8%))',
    '--checkbox-indicator': 'rgb(30 41 59)',
    '--checkbox-shadow-checked': '0 18px 32px -20px rgba(var(--accent-rgb), 0.55)',
  } as CSSProperties,
  neutral: {
    '--checkbox-border': 'rgba(var(--border-rgb), 0.7)',
    '--checkbox-border-hover': 'rgba(var(--border-rgb), 0.9)',
    '--checkbox-border-active': 'rgba(var(--border-rgb), 0.95)',
    '--checkbox-bg': 'color-mix(in srgb, var(--card) 90%, transparent)',
    '--checkbox-bg-hover': 'color-mix(in srgb, var(--card) 98%, transparent)',
    '--checkbox-bg-checked':
      'linear-gradient(150deg, color-mix(in srgb, rgb(var(--fg-rgb)) 18%, white 82%), color-mix(in srgb, rgb(var(--fg-rgb)) 12%, transparent))',
    '--checkbox-indicator': 'rgb(var(--fg-rgb))',
    '--checkbox-shadow-checked': '0 16px 30px -24px rgba(var(--fg-rgb), 0.35)',
  } as CSSProperties,
  muted: {
    '--checkbox-border': 'rgba(var(--muted-foreground-rgb, 78 94 120), 0.55)',
    '--checkbox-border-hover': 'rgba(var(--muted-foreground-rgb, 78 94 120), 0.75)',
    '--checkbox-border-active': 'rgba(var(--muted-foreground-rgb, 78 94 120), 0.9)',
    '--checkbox-bg': 'color-mix(in srgb, var(--muted) 65%, transparent)',
    '--checkbox-bg-hover': 'color-mix(in srgb, var(--muted) 78%, transparent)',
    '--checkbox-bg-checked':
      'linear-gradient(135deg, color-mix(in srgb, var(--muted) 85%, white 6%), color-mix(in srgb, var(--muted) 92%, white 4%))',
    '--checkbox-indicator': 'rgb(var(--fg-rgb))',
    '--checkbox-shadow-checked':
      '0 18px 32px -22px rgba(var(--muted-foreground-rgb, 78 94 120), 0.35)',
  } as CSSProperties,
};

const sizeClassNames: Record<CheckboxSize, string> = {
  sm: '[--checkbox-size:1.05rem] gap-[0.6rem] text-[0.85rem]',
  md: '[--checkbox-size:1.25rem]',
  lg: '[--checkbox-size:1.45rem] gap-[0.85rem] text-[1rem]',
};

interface CheckboxProps extends Omit<CheckboxPrimitive.CheckboxProps, 'children'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  tone?: CheckboxTone;
  size?: CheckboxSize;
  helperText?: React.ReactNode;
  className?: string;
  controlClassName?: string;
}

/**
 * Accessible checkbox built on top of Radix primitives.
 * Styled with CyanNobat design tokens for predictable glassmorphic visuals.
 *
 * @example
 * ```tsx
 * <Checkbox label="قوانین را می‌پذیرم" defaultChecked />
 * <Checkbox label="اعلان‌ها" tone="muted" description="ارسال اعلان‌های ایمیل" />
 * <Checkbox label="حریم خصوصی" tone="neutral" size="sm" />
 * ```
 */
const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      label,
      description,
      helperText,
      tone = 'accent',
      size = 'md',
      id,
      className,
      controlClassName,
      disabled,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const checkboxId = id ?? `checkbox-${reactId}`;
    const descriptionId = description ? `${checkboxId}-description` : undefined;
    const helperId = helperText ? `${checkboxId}-helper` : undefined;
    const describedBy = [descriptionId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <label
        className={cn(
          'inline-flex items-start gap-3 text-right text-[0.95rem] leading-[1.4] text-foreground transition-colors duration-200 ease-glass select-none cursor-pointer',
          '[--checkbox-radius:calc(var(--radius-sm)/1.35)]',
          '[--checkbox-shadow:inset_0_1px_0_rgba(255,255,255,0.45)]',
          'hover:text-[color-mix(in_srgb,rgb(var(--fg-rgb))_92%,white_8%)]',
          'focus-within:text-[color-mix(in_srgb,rgb(var(--fg-rgb))_94%,white_6%)]',
          'dark:[--checkbox-shadow:inset_0_1px_0_rgba(120,190,255,0.18)]',
          sizeClassNames[size],
          'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-65 data-[disabled=true]:[filter:saturate(0.75)]',
          className,
        )}
        style={checkboxToneStyles[tone]}
        data-disabled={disabled ? 'true' : undefined}
        htmlFor={checkboxId}
      >
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          className={cn(
            'relative inline-flex h-[var(--checkbox-size,1.25rem)] w-[var(--checkbox-size,1.25rem)] items-center justify-center rounded-[var(--checkbox-radius)] border border-[var(--checkbox-border)] bg-[var(--checkbox-bg)] text-[var(--checkbox-indicator)] shadow-[var(--checkbox-shadow)] transition-[border-color,background,box-shadow,transform] duration-200 ease-glass',
            'hover:border-[var(--checkbox-border-hover)] hover:bg-[var(--checkbox-bg-hover)]',
            'data-[state=checked]:border-[var(--checkbox-border-active)] data-[state=checked]:bg-[var(--checkbox-bg-checked)] data-[state=checked]:shadow-[var(--checkbox-shadow-checked)] data-[state=checked]:text-[var(--checkbox-indicator)]',
            'data-[state=indeterminate]:border-[var(--checkbox-border-active)] data-[state=indeterminate]:bg-[var(--checkbox-bg-checked)] data-[state=indeterminate]:shadow-[var(--checkbox-shadow-checked)]',
            'focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_25%,transparent),0_0_0_5px_rgb(var(--ring-rgb)/0.35)]',
            'data-[disabled=true]:pointer-events-none disabled:pointer-events-none',
            controlClassName,
          )}
          disabled={disabled}
          data-disabled={disabled ? 'true' : undefined}
          aria-describedby={describedBy}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={cn(
              'pointer-events-none absolute inset-0 grid place-items-center',
              '[&>svg]:h-[calc(var(--checkbox-size,1.25rem)*0.65)] [&>svg]:w-[calc(var(--checkbox-size,1.25rem)*0.65)]',
              '[&>svg]:scale-90 [&>svg]:opacity-0 [&>svg]:transition-all [&>svg]:duration-150 [&>svg]:ease-glass',
              '[&>svg]:stroke-[2.25] [&>svg]:text-current',
              'data-[state=checked]:[&>svg:first-child]:opacity-100 data-[state=checked]:[&>svg:first-child]:scale-100',
              'data-[state=indeterminate]:[&>svg:last-child]:opacity-100 data-[state=indeterminate]:[&>svg:last-child]:scale-100',
            )}
          >
            <Check aria-hidden className="pointer-events-none" />
            <Minus aria-hidden className="pointer-events-none" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {(label || description || helperText) && (
          <span className="flex flex-col gap-1 text-right">
            {label && <span className="font-semibold text-[inherit]">{label}</span>}
            {description && (
              <span
                id={descriptionId}
                className="text-[0.85rem] text-[rgba(var(--fg-rgb),0.72)] dark:text-[rgba(var(--fg-rgb),0.7)]"
              >
                {description}
              </span>
            )}
            {helperText && (
              <span
                id={helperId}
                className="text-[0.78rem] text-[rgba(var(--fg-rgb),0.62)] dark:text-[rgba(var(--fg-rgb),0.55)]"
              >
                {helperText}
              </span>
            )}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, type CheckboxProps, type CheckboxTone, type CheckboxSize };
