'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

interface ServiceCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  icon?: ReactNode;
  title: string;
  description?: string;
  badge?: string;
  isSelected?: boolean;
  className?: string;
}

const ServiceCard = ({
  icon,
  title,
  description,
  badge,
  isSelected = false,
  className,
  type = 'button',
  ...buttonProps
}: ServiceCardProps) => {
  const prefersReducedMotion = useReducedMotion();

  const hoverAnimation = prefersReducedMotion ? undefined : { y: -6, scale: 1.01 };
  const tapAnimation = prefersReducedMotion ? undefined : { scale: 0.97 };

  return (
    <motion.button
      type={type}
      {...buttonProps}
      aria-pressed={isSelected}
      className={clsx(
        'group relative overflow-hidden rounded-[1.6rem] border px-5 py-5 text-right transition-all duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'bg-white/60 shadow-[0_12px_35px_rgba(31,38,135,0.18)] backdrop-blur-xl',
        'hover:shadow-[0_20px_45px_-20px_rgba(88,175,192,0.65)]',
        'dark:bg-white/10 dark:shadow-[0_16px_36px_rgba(8,12,24,0.5)]',
        isSelected
          ? 'border-accent/70 shadow-[0_22px_55px_-22px_rgba(88,175,192,0.78)] dark:border-accent/50'
          : 'border-white/30 hover:border-accent/40 dark:border-white/12 dark:hover:border-accent/40',
        className,
      )}
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      transition={{ type: 'spring', stiffness: 340, damping: 24 }}
      data-selected={isSelected ? 'true' : undefined}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-70 mix-blend-screen dark:from-white/10"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70"
      />
      <AnimatePresence>
        {isSelected ? (
          <motion.span
            key="card-glow"
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[1.6rem] border border-accent/50 bg-accent/18 opacity-80 mix-blend-screen dark:bg-accent/12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          />
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex w-full flex-row-reverse items-start gap-3">
          {icon ? (
            <div
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/25 via-white/45 to-white/65 text-xl text-accent shadow-[inset_0_2px_6px_rgba(255,255,255,0.55)] backdrop-blur-sm dark:from-accent/18 dark:via-white/12 dark:to-white/8"
            >
              <span>{icon}</span>
            </div>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
            {badge ? (
              <span className="inline-flex rounded-full bg-accent/18 px-3 py-1 text-[11px] font-semibold text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-sm dark:bg-accent/12 dark:text-accent/90">
                {badge}
              </span>
            ) : null}
            <h3 className="text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-accent">
              {title}
            </h3>
            {description ? <p className="text-sm leading-relaxed text-muted/80">{description}</p> : null}
          </div>
        </div>

        <AnimatePresence>
          {isSelected ? (
            <motion.div
              key="selected-state"
              initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 8 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: 'easeOut' }}
              className="flex items-center justify-end gap-2 text-sm font-medium text-accent"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>انتخاب شد</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.button>
  );
};

export default ServiceCard;
