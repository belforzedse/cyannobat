'use client';

import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { type ProgressStepWithStatus } from '@/lib/booking/types';
import GlassCard from '../GlassCard';
import { GlassChip } from '../ui';

type BookingStepperProps = {
  steps: ProgressStepWithStatus[];
  prefersReducedMotion: boolean | null;
};

const toPersianDigits = (value: number) => value.toLocaleString('fa-IR', { useGrouping: false });

const BookingStepper = ({ steps, prefersReducedMotion }: BookingStepperProps) => (
  <motion.ul
    initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      delay: prefersReducedMotion ? 0 : 0.35,
      duration: prefersReducedMotion ? 0 : 0.5,
    }}
    className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4"
  >
    {steps.map((step) => (
      <motion.li
        key={step.key}
        aria-current={step.status === 'current' ? 'step' : undefined}
        className={clsx(
          // base glassy pill
          'relative flex h-[95px] items-center justify-center overflow-hidden',
          'rounded-[20px] border border-white/70',
          'bg-gray/20',
          'shadow-[0_22px_60px_-32px_rgba(15,35,80,0.55),inset_0_1px_0_rgba(255,255,255,0.9)]',
          'backdrop-blur-[18px] backdrop-saturate-[1.4]',
          'px-8 text-right transition-all duration-300',
          // subtle emphasis for current step
          step.status === 'current' && 'ring-2 bg-white ring-accent/10',
        )}
      >
        {/* Number bubble */}
        <GlassChip
          className={clsx(
            'pointer-events-none relative ',
            'flex h-auto w-20 items-center p-3 align-center justify-center rounded-full',
            'bg-gray',
            'text-2xl font-extrabold text-[#32466f]',
            'shadow-[0_16px_35px_-18px_rgba(15,35,80,0.6),inset_0_1px_0_rgba(255,255,255,0.95)]',
            step.status === 'current' && 'bg-white',
          )}
        >
          <span className="text-[#5C7299] text-4xl font-rokh ">
            {' '}
            {toPersianDigits(step.index + 1)}
          </span>
        </GlassChip>

        {/* Title + status */}
        <div className="flex w-full flex-col items-start mr-2 justify gap-1 ">
          <span className="text-base font-semibold leading-relaxed text-[#5C7299] sm:text-2xl">
            {step.label}
          </span>

          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={step.status}
              initial={{
                opacity: prefersReducedMotion ? 1 : 0,
                y: prefersReducedMotion ? 0 : 6,
              }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: prefersReducedMotion ? 1 : 0,
                y: prefersReducedMotion ? 0 : -6,
              }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
              className={clsx(
                'mt-1 flex items-center gap-1.5 text-[11px] font-medium',
                step.status === 'complete' ? 'text-accent' : 'text-slate-400',
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
                  <span
                    className="h-2 w-2 rounded-full bg-[#2ed573] shadow-[0_0_0_3px_rgba(46,213,115,0.2)]"
                    aria-hidden
                  />
                  <span>در حال انجام</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                  <span>در انتظار</span>
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.li>
    ))}
  </motion.ul>
);

export default BookingStepper;
