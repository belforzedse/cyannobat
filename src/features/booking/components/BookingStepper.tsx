'use client';

import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { type ProgressStepWithStatus } from '../types';

type BookingStepperProps = {
  steps: ProgressStepWithStatus[];
  prefersReducedMotion: boolean | null;
};

const BookingStepper = ({ steps, prefersReducedMotion }: BookingStepperProps) => (
  <motion.ul
    initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: prefersReducedMotion ? 0 : 0.35, duration: prefersReducedMotion ? 0 : 0.5 }}
    className="grid gap-3 text-sm sm:grid-cols-3"
  >
    {steps.map((step) => (
      <motion.li
        key={step.key}
        className={clsx(
          'relative flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-right shadow-sm backdrop-blur-sm transition-all duration-300',
          step.status === 'complete' &&
            'border-accent/60 bg-accent/15 text-foreground shadow-[0_14px_32px_-20px_rgba(88,175,192,0.6)] dark:border-accent/50 dark:bg-accent/12',
          step.status === 'current' &&
            'border-white/30 bg-white/45 text-foreground shadow-[0_12px_28px_-20px_rgba(31,38,135,0.25)] dark:border-white/18 dark:bg-white/15',
          step.status === 'upcoming' &&
            'border-white/20 bg-white/25 text-muted-foreground dark:border-white/12 dark:bg-white/8 dark:text-muted-foreground',
        )}
        aria-current={step.status === 'current' ? 'step' : undefined}
      >
        <div className="flex flex-row-reverse items-center gap-3">
          <span
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]',
              step.status === 'complete' && 'bg-gradient-to-br from-accent to-accent/80 text-slate-900',
              step.status === 'current' && 'bg-gradient-to-br from-white/85 to-white/65 text-foreground',
              step.status === 'upcoming' && 'bg-white/40 text-muted-foreground dark:bg-white/10',
            )}
          >
            ۰{step.index + 1}
          </span>
          <span className="text-sm font-semibold">{step.label}</span>
        </div>
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={step.status}
            initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : -6 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            className={clsx(
              'flex flex-row-reverse items-center gap-1 text-[11px] font-medium',
              step.status === 'complete' ? 'text-accent' : 'text-muted-foreground',
            )}
          >
            {step.status === 'complete' ? (
              <>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-7.657 7.657a1 1 0 01-1.414 0L5.293 11.02a1 1 0 011.414-1.414l1.929 1.93 6.95-6.95a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>تکمیل شد</span>
              </>
            ) : step.status === 'current' ? (
              <>
                <span className="h-2 w-2 rounded-full bg-accent/70" aria-hidden />
                <span>در حال انجام</span>
              </>
            ) : (
              <span>در انتظار</span>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.li>
    ))}
  </motion.ul>
);

export default BookingStepper;
