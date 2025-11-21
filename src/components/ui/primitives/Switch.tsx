'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import React, { CSSProperties, forwardRef, useId } from 'react';

import { cn } from '@/lib/utils';

type SwitchTone = 'accent' | 'neutral' | 'muted';
type SwitchSize = 'sm' | 'md' | 'lg';

const toneVariantStyles: Record<SwitchTone, CSSProperties> = {
  accent: {
    '--switch-bg': 'color-mix(in srgb, var(--accent) 18%, var(--card))',
    '--switch-bg-hover': 'color-mix(in srgb, var(--accent) 26%, var(--card))',
    '--switch-bg-checked':
      'linear-gradient(140deg, color-mix(in srgb, var(--accent-strong) 82%, white 12%), color-mix(in srgb, var(--accent) 92%, white 8%))',
    '--switch-border': 'rgba(var(--accent-rgb), 0.45)',
    '--switch-border-hover': 'rgba(var(--accent-rgb), 0.65)',
    '--switch-border-active': 'rgba(var(--accent-rgb), 0.75)',
    '--switch-thumb': 'rgb(30 41 59)',
    '--switch-thumb-shadow': '0 10px 20px -16px rgba(var(--accent-rgb), 0.55)',
    '--switch-shadow-checked': '0 20px 36px -26px rgba(var(--accent-rgb), 0.45)',
  } as CSSProperties,
  neutral: {
    '--switch-bg': 'color-mix(in srgb, var(--card) 90%, transparent)',
    '--switch-bg-hover': 'color-mix(in srgb, var(--card) 96%, transparent)',
    '--switch-bg-checked':
      'linear-gradient(140deg, color-mix(in srgb, rgb(var(--fg-rgb)) 18%, white 82%), color-mix(in srgb, rgb(var(--fg-rgb)) 12%, transparent))',
    '--switch-border': 'rgba(var(--border-rgb), 0.65)',
    '--switch-border-hover': 'rgba(var(--border-rgb), 0.85)',
    '--switch-border-active': 'rgba(var(--border-rgb), 0.95)',
    '--switch-thumb': 'rgb(var(--fg-rgb))',
    '--switch-thumb-shadow': '0 10px 20px -18px rgba(var(--fg-rgb), 0.38)',
    '--switch-shadow-checked': '0 18px 34px -26px rgba(var(--fg-rgb), 0.32)',
  } as CSSProperties,
  muted: {
    '--switch-bg': 'color-mix(in srgb, var(--muted) 72%, transparent)',
    '--switch-bg-hover': 'color-mix(in srgb, var(--muted) 82%, transparent)',
    '--switch-bg-checked':
      'linear-gradient(145deg, color-mix(in srgb, var(--muted) 88%, white 8%), color-mix(in srgb, var(--muted) 94%, white 4%))',
    '--switch-border': 'rgba(var(--muted-foreground-rgb, 78 94 120), 0.55)',
    '--switch-border-hover': 'rgba(var(--muted-foreground-rgb, 78 94 120), 0.75)',
    '--switch-border-active': 'rgba(var(--muted-foreground-rgb, 78 94 120), 0.9)',
    '--switch-thumb': 'rgb(var(--fg-rgb))',
    '--switch-thumb-shadow': '0 10px 22px -18px rgba(var(--muted-foreground-rgb, 78 94 120), 0.4)',
    '--switch-shadow-checked':
      '0 18px 34px -26px rgba(var(--muted-foreground-rgb, 78 94 120), 0.32)',
  } as CSSProperties,
};

const sizeClassNames: Record<SwitchSize, string> = {
  sm: '[--switch-width:2.3rem] [--switch-height:1.25rem] [--switch-padding:1.5px] gap-[0.6rem] text-[0.85rem]',
  md: '[--switch-width:2.75rem] [--switch-height:1.5rem] [--switch-padding:2px]',
  lg: '[--switch-width:3.25rem] [--switch-height:1.75rem] [--switch-padding:3px] gap-[0.85rem] text-[1rem]',
};

interface SwitchProps extends SwitchPrimitive.SwitchProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  tone?: SwitchTone;
  size?: SwitchSize;
  className?: string;
  thumbClassName?: string;
}

/**
 * CyanNobat toggle switch using Radix primitives for accessibility.
 *
 * @example
 * ```tsx
 * <Switch label="ارسال اعلان" defaultChecked />
 * <Switch label="حالت تاریک" tone="neutral" />
 * <Switch label="به‌روزرسانی خودکار" size="lg" description="دانلود در پس‌زمینه" />
 * ```
 */
const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      label,
      description,
      tone = 'accent',
      size = 'md',
      id,
      className,
      thumbClassName,
      disabled,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const switchId = id ?? `switch-${reactId}`;
    const descriptionId = description ? `${switchId}-description` : undefined;

    return (
      <label
        className={cn(
          'inline-flex items-center gap-3 text-right text-[0.95rem] leading-[1.4] text-foreground transition-colors duration-200 ease-glass select-none cursor-pointer',
          '[--switch-width:2.75rem] [--switch-height:1.5rem] [--switch-padding:2px] [--switch-radius:var(--radius-pill)]',
          'hover:text-[color-mix(in_srgb,rgb(var(--fg-rgb))_92%,white_8%)]',
          'focus-within:text-[color-mix(in_srgb,rgb(var(--fg-rgb))_94%,white_6%)]',
          sizeClassNames[size],
          'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[disabled=true]:[filter:saturate(0.75)]',
          className,
        )}
        style={toneVariantStyles[tone]}
        data-disabled={disabled ? 'true' : undefined}
        htmlFor={switchId}
      >
        <SwitchPrimitive.Root
          ref={ref}
          id={switchId}
          className={cn(
            'relative inline-flex h-[var(--switch-height,1.5rem)] w-[var(--switch-width,2.75rem)] items-center rounded-[var(--switch-radius)] border border-[var(--switch-border)] bg-[var(--switch-bg)] p-[var(--switch-padding,2px)]',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[background,border-color,box-shadow] duration-200 ease-glass',
            'hover:border-[var(--switch-border-hover)] hover:bg-[var(--switch-bg-hover)]',
            'data-[state=checked]:border-[var(--switch-border-active)] data-[state=checked]:bg-[var(--switch-bg-checked)] data-[state=checked]:shadow-[var(--switch-shadow-checked)]',
            'focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_20%,transparent),0_0_0_5px_rgb(var(--ring-rgb)/0.35)]',
            'data-[disabled=true]:pointer-events-none disabled:pointer-events-none',
          )}
          disabled={disabled}
          data-disabled={disabled ? 'true' : undefined}
          aria-describedby={descriptionId}
          {...props}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              'inline-block h-[calc(var(--switch-height,1.5rem)-var(--switch-padding,2px)*2)] w-[calc(var(--switch-height,1.5rem)-var(--switch-padding,2px)*2)] rounded-full bg-[var(--switch-thumb)] shadow-[var(--switch-thumb-shadow)] transition-[transform,background,box-shadow] duration-200 ease-glass will-change-transform',
              'data-[state=checked]:translate-x-[calc(var(--switch-width,2.75rem)-var(--switch-height,1.5rem))]',
              'data-[disabled=true]:pointer-events-none',
              thumbClassName,
            )}
          />
        </SwitchPrimitive.Root>

        {(label || description) && (
          <span className="flex flex-col gap-1 text-right">
            {label && <span className="font-semibold text-[inherit]">{label}</span>}
            {description && (
              <span
                id={descriptionId}
                className="text-[0.85rem] text-[rgba(var(--fg-rgb),0.68)] dark:text-[rgba(var(--fg-rgb),0.7)]"
              >
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  },
);

Switch.displayName = 'Switch';

export { Switch, type SwitchProps, type SwitchSize, type SwitchTone };
