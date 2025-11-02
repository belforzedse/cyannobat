'use client';

import { HTMLAttributes, forwardRef } from 'react';

import { GlassChip, type GlassChipTone, type GlassChipShape } from './glass';

type ChipVariant = 'default' | 'muted' | 'current' | 'active' | 'circle';

interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant mapped to GlassChip tone/shape options
   * - default: Standard glass chip
   * - muted: Lighter glass tone
   * - current: Current selection state
   * - active: Accent/selected state
   * - circle: Circular chip
   */
  variant?: ChipVariant;
  /**
   * Make chip interactive (hover/focus states)
   */
  interactive?: boolean;
  /**
   * Optional metadata text (smaller, muted)
   */
  meta?: string;
  /**
   * Left icon/element
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon/element
   */
  rightIcon?: React.ReactNode;
}

/**
 * Unified Chip component built on the GlassChip primitive
 * Used for tags, time slots, status indicators, etc.
 *
 * @example
 * ```tsx
 * <Chip variant="default" interactive>10:00</Chip>
 * <Chip variant="active">انتخاب شده</Chip>
 * <Chip variant="circle" meta="5">A</Chip>
 * ```
 */
const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      variant = 'default',
      interactive = false,
      meta,
      leftIcon,
      rightIcon,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const toneMap: Record<ChipVariant, GlassChipTone> = {
      default: 'default',
      muted: 'muted',
      current: 'current',
      active: 'active',
      circle: 'default',
    };
    const shapeMap: Record<ChipVariant, GlassChipShape> = {
      default: 'default',
      muted: 'default',
      current: 'default',
      active: 'default',
      circle: 'circle',
    };

    return (
      <GlassChip
        ref={ref}
        tone={toneMap[variant]}
        shape={shapeMap[variant]}
        interactive={interactive}
        className={className}
        {...props}
      >
        {leftIcon && <span className="inline-flex">{leftIcon}</span>}
        <span className="inline-flex flex-col items-center gap-0.5">
          {children}
          {meta && <span className="text-[0.7rem] text-muted-foreground">{meta}</span>}
        </span>
        {rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </GlassChip>
    );
  },
);

Chip.displayName = 'Chip';

export { Chip, type ChipProps, type ChipVariant };
