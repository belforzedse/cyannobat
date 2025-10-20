'use client';

import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';

import { Card, Textarea } from '@/components/ui';
import { luxuryContainer, luxuryPresets, luxurySlideFade } from '@/lib/luxuryAnimations';
import { type ReasonOption } from '../types';

type ReasonsSectionProps = {
  options: readonly ReasonOption[];
  selectedReasons: string[];
  onToggleReason: (value: string) => void;
  additionalReason: string;
  onAdditionalReasonChange: (value: string) => void;
};

const ReasonsSection = ({
  options,
  selectedReasons,
  onToggleReason,
  additionalReason,
  onAdditionalReasonChange,
}: ReasonsSectionProps) => {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion);

  const sectionVariants = reduceMotion ? undefined : luxuryPresets.whisper('up');
  const listVariants = reduceMotion ? undefined : luxuryContainer;
  const itemVariants = reduceMotion
    ? undefined
    : luxurySlideFade('up', {
        distance: 20,
        duration: 0.55,
        delayIn: 0.06,
      });

  const motionStates = reduceMotion ? {} : { initial: 'initial' as const, animate: 'animate' as const };

  return (
    <motion.section variants={sectionVariants} {...motionStates}>
      <Card variant="default" padding="lg" className="sm:rounded-3xl">
        <div className="flex flex-col items-end gap-1 sm:gap-2 text-right">
          <h3 className="text-sm font-semibold text-foreground">دلیل مراجعه</h3>
          <p className="text-xs leading-6 text-muted-foreground">
            یکی از گزینه‌های زیر را انتخاب کنید یا توضیح کوتاهی درباره‌ی نیاز خود بنویسید.
          </p>
        </div>
        <motion.div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3 lg:mt-5" variants={listVariants} {...motionStates}>
          {options.map((reason) => {
            const isSelected = selectedReasons.includes(reason.value);
            return (
              <motion.button
                type="button"
                key={reason.value}
                onClick={() => onToggleReason(reason.value)}
                className={clsx(
                  'flex w-full flex-row-reverse items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-right shadow-sm',
                  // Smooth, slow transitions for all properties
                  'transition-all duration-300 ease-out',
                  'hover:border-accent/60 hover:bg-accent/10 dark:hover:border-accent/50 dark:hover:bg-accent/10',
                  isSelected
                    ? 'border-accent/70 bg-accent/20 text-foreground shadow-[0_12px_28px_-22px_rgba(88,175,192,0.75)] dark:border-accent/60'
                    : 'border-white/25 bg-white/45 text-muted-foreground dark:border-white/15 dark:bg-black/40',
                )}
                variants={itemVariants}
              >
                <span className="text-sm font-medium">{reason.label}</span>
                <span
                  className={clsx(
                    'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold',
                    // Smooth, slow transitions for the checkmark circle
                    'transition-all duration-300 ease-out',
                    isSelected
                      ? 'border-accent/70 bg-accent text-slate-900'
                      : 'border-white/30 bg-white/40 text-muted-foreground dark:border-white/20 dark:bg-black/30',
                  )}
                  aria-hidden
                >
                  {isSelected ? '✓' : '۰'}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
        <Textarea
          label="توضیحات تکمیلی"
          className="mt-4 sm:mt-5 lg:mt-6"
          value={additionalReason}
          onChange={(event) => onAdditionalReasonChange(event.target.value)}
          placeholder="در صورت نیاز جزئیات بیشتری را بنویسید"
          rows={5}
        />
      </Card>
    </motion.section>
  );
};

export default ReasonsSection;
