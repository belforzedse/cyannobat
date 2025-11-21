'use client';

import { useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock3, Stethoscope, FileHeart, type LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass';
import { luxuryContainer, luxurySlideFade } from '@/lib/animation';

export type Step = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const defaultSteps: Step[] = [
  {
    title: 'انتخاب خدمت',
    description: `بیمار نوع خدمت مورد نظرش رو از لیست خدمات مطب یا کلینیک انتخاب می‌کنه
(مثلاً ویزیت عمومی، زیبایی، ارتودنسی و...).`,
    icon: Stethoscope,
  },
  {
    title: 'انتخاب تاریخ و زمان',
    description: `با مشاهده‌ی تقویم پزشک، کاربر روز و ساعت مناسب خودش رو انتخاب می‌کنه —
بدون نیاز به تماس تلفنی یا هماهنگی منشی`,
    icon: Clock3,
  },
  {
    title: 'تأیید جزئیات',
    description: `بیمار اطلاعات خودش رو وارد و نوبت رو تأیید می‌کنه.
در پایان، پیام یادآوری از طریق SMS یا واتساپ برای او ارسال می‌شود.`,
    icon: FileHeart,
  },
];

interface ProcessStepsProps {
  steps?: Step[];
  className?: string;
}

export const ProcessSteps = ({ steps = defaultSteps, className }: ProcessStepsProps) => {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion);

  const configureSlideFade = useCallback(
    (
      direction: Parameters<typeof luxurySlideFade>[0],
      options: Parameters<typeof luxurySlideFade>[1] = {},
    ) => {
      if (!reduceMotion) {
        return luxurySlideFade(direction, options);
      }

      const { duration = 0.35, delayIn, delayOut } = options ?? {};

      return luxurySlideFade(direction, {
        ...options,
        distance: 0,
        scale: 1,
        blur: 0,
        duration: duration > 0.35 ? 0.35 : duration,
        delayIn: delayIn ?? 0,
        delayOut: delayOut ?? 0,
      });
    },
    [reduceMotion],
  );

  return (
    <motion.section
      id="steps"
      className={className}
      variants={prefersReducedMotion ? undefined : luxuryContainer}
      initial="initial"
      animate="animate"
    >
      {steps.map((step, index) => (
        <motion.div
          key={step.title}
          variants={configureSlideFade('right', {
            distance: 32,
            duration: 0.8,
            scale: 0.96,
            blur: 0,
            delayIn: index * 0.08 + 0.15,
          })}
          initial="initial"
          animate="animate"
        >
          <GlassCard className="h-full min-h-[230px] rounded-3xl p-5 sm:p-6">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 text-foreground">
                <span className="relative inline-grid h-8 w-8 place-items-center">
                  {/* Glow layer (behind) */}
                  <step.icon
                    aria-hidden
                    className="col-start-1 row-start-1 h-6 w-6 text-accent/70 opacity-35 blur-[1px] drop-shadow-[0_6px_18px_rgba(76,139,234,0.35)]"
                    strokeWidth={2.6}
                  />
                  {/* Crisp layer (front) */}
                  <step.icon
                    aria-hidden
                    className="col-start-1 row-start-1 h-6 w-6 text-black dark:text-white/95 drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)]"
                    strokeWidth={2.1}
                  />
                </span>

                <h3 className="text-[24px] font-medium leading-tight">{step.title}</h3>
              </div>
              <p dir="rtl" className="text-sm leading-7 text-foreground/90 sm:text-[0.95rem]">
                {step.description}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </motion.section>
  );
};
