'use client';

import { Fragment, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui';
import GlassIcon from '@/components/GlassIcon';
import { GlassSurface } from '@/components/ui/glass';
import { Calendar, Search, CheckCircle2, ArrowLeft } from 'lucide-react';
import { BOOKING_PATH } from '@/lib/routes';
import { luxuryContainer, luxurySlideFade } from '@/lib/luxuryAnimations';

const steps = [
  {
    title: 'انتخاب خدمت',
    bullets: [
      'مرور دسته‌بندی خدمات',
      'بررسی توضیح کوتاه هر گزینه',
      'انتخاب متناسب با نیاز',
    ],
    icon: Search,
  },
  {
    title: 'انتخاب تاریخ و زمان',
    bullets: [
      'مشاهده زمان‌های آزاد در لحظه',
      'فیلتر بر اساس روز دلخواه',
      'هماهنگی با ارائه‌دهنده مناسب',
    ],
    icon: Calendar,
  },
  {
    title: 'تایید جزئیات',
    bullets: [
      'بازبینی اطلاعات تماس',
      'تایید خلاصه نوبت',
      'ثبت نهایی با یک کلیک',
    ],
    icon: CheckCircle2,
  },
];

const HeroPage = () => {
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

  // Create performance-optimized luxury animations
  // Note: Blur is expensive but used ONLY on initial load, not continuous animations
  // Framer Motion uses GPU acceleration (transform + opacity) for smooth 60fps

  const heroCardVariants = configureSlideFade('right', {
    distance: 32,
    duration: 0.9,
    scale: 0.96, // Subtle scale (96% vs 95%)
    blur: 0, // No blur for main card (performance)
    delayIn: 0.1,
  });

  const titleVariants = configureSlideFade('up', {
    distance: 24,
    duration: 0.9,
    scale: 0.96,
    blur: 1, // Minimal blur (1px) for premium feel
    delayIn: 0.3,
  });

  const descriptionVariants = configureSlideFade('up', {
    distance: 16,
    duration: 1.0,
    scale: 0.98,
    blur: 0,
    delayIn: 0.4,
  });

  const buttonsVariants = configureSlideFade('up', {
    distance: 16,
    duration: 1.0,
    scale: 0.98,
    blur: 0,
    delayIn: 0.5,
  });

  return (
    <div className="flex flex-col pb-8">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_minmax(200px,500px)] lg:items-stretch">
        {/* Steps Section */}
        <motion.section
          id="steps"
          className="order-2 space-y-4 text-right lg:order-2 lg:space-y-6"
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
                blur: 0, // No blur for better performance
                delayIn: index * 0.08 + 0.15,
              })}
              initial="initial"
              animate="animate"
            >
              <GlassCard className="h-full min-h-[230px] rounded-3xl p-5 sm:p-6">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-3 text-foreground">
                    <GlassIcon icon={step.icon} size="sm" label={step.title} className="shrink-0" />
                    <h3 className="text-base font-semibold leading-tight sm:text-lg">
                      {step.title}
                    </h3>
                  </div>
                  <div
                    dir="rtl"
                    className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm leading-6 text-foreground/90 sm:text-[0.95rem]"
                  >
                    {step.bullets.map((bullet, bulletIndex) => (
                      <Fragment key={`${step.title}-${bulletIndex}`}>
                        <span className="whitespace-nowrap">{bullet}</span>
                        {bulletIndex < step.bullets.length - 1 ? (
                          <span aria-hidden className="px-1 text-accent/70">
                            •
                          </span>
                        ) : null}
                      </Fragment>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.section>

        {/* Hero Card Section */}
        <GlassSurface
          as={motion.section}
          variants={heroCardVariants}
          initial="initial"
          animate="animate"
          className="order-1 relative flex h-full min-h-[440px] flex-col overflow-hidden px-8 pb-20 pt-20 text-right sm:px-14 lg:order-1 lg:px-24"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{ background: 'radial-gradient(circle at top, var(--accent) 0%, transparent 55%)' }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-white/18 backdrop-blur-[2px] mix-blend-screen"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-b from-accent/50 via-transparent to-transparent"
            aria-hidden
          />
          <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-accent/25 blur-3xl" aria-hidden />
          <div className="relative flex flex-1 flex-col items-end gap-6">
            <Image
              src="/images/image 50.png"
              alt="Saayan"
              width={400}
              height={500}
              className="pointer-events-none absolute right-1/2 top-1/2 z-20 h-auto w-[420px] translate-x-1/2 -translate-y-1/2 sm:right-[18%] sm:w-[500px] sm:translate-x-0 lg:w-[560px]"
              priority
            />
            <motion.h1
              variants={titleVariants}
              initial="initial"
              animate="animate"
              className="relative z-10 max-w-3xl text-balance text-[2.5rem] font-semibold leading-tight tracking-tight text-foreground sm:text-[2.875rem] lg:text-[3.5rem]"
            >
              <span className="relative inline-flex items-center">
                <span
                  className="pointer-events-none absolute inset-x-[-18px] top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-l from-foreground/10 via-white/80 to-foreground/15 blur-[1px]"
                  aria-hidden
                />
                <span className="relative bg-gradient-to-b from-foreground to-foreground/75 bg-clip-text px-4 text-transparent">
                  سایـــــــــان نوبت
                </span>
              </span>
            </motion.h1>
            <motion.p
              variants={descriptionVariants}
              initial="initial"
              animate="animate"
              className="relative z-10 max-w-2xl text-balance text-sm leading-7 text-foreground/75 sm:text-base"
            >
              نوبت‌های پزشکی را در چند لحظه هماهنگ کنید و تجربه‌ای لوکس و دقیق بسازید.
            </motion.p>
            <motion.div
              variants={buttonsVariants}
              initial="initial"
              animate="animate"
              className="mt-auto flex flex-row-reverse flex-wrap items-center justify-end gap-4 pt-4"
            >
              <Link href={BOOKING_PATH}>
                <Button variant="ghost" size="lg" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  رزرو نوبت
                </Button>
              </Link>
              <Link href="#steps">
                <Button variant="ghost" size="lg">
                  مشاهده مراحل
                </Button>
              </Link>
            </motion.div>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
};

export default HeroPage;
