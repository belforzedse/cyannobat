'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui';
import GlassIcon from '@/components/GlassIcon';
import { GlassSurface } from '@/components/ui/glass';
import { Calendar, Search, CheckCircle2 } from 'lucide-react';
import { BOOKING_PATH } from '@/lib/routes';
import { luxuryContainer, luxurySlideFade } from '@/lib/luxuryAnimations';

const steps = [
  {
    title: 'انتخاب خدمت',
    description:
      'از میان خدمات تخصصی و بسته‌های سفارشی‌شده، بهترین گزینه را برای نیاز خود برگزینید.',
    icon: Search,
  },
  {
    title: 'انتخاب تاریخ و زمان',
    description:
      'بازه دلخواه خود را از میان زمان‌های آزاد انتخاب کنید؛ ارائه‌دهنده مناسب با همان بازه هماهنگ است.',
    icon: Calendar,
  },
  {
    title: 'تایید جزئیات',
    description:
      'اطلاعات تماس و خلاصه نوبت را مرور کنید و پیش از ثبت نهایی، همه چیز را یک‌جا تایید نمایید.',
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

  const badgeVariants = configureSlideFade('up', {
    distance: 16,
    duration: 0.8,
    scale: 0.98,
    blur: 0, // No blur (performance)
    delayIn: 0.2,
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
          className="order-2 space-y-6 text-right lg:order-2 lg:space-y-8"
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
              <GlassCard
                title={step.title}
                description={step.description}
                className="h-full min-h-[230px]"
              >
                <div className="mt-4 flex items-center justify-between">
                  <GlassIcon icon={step.icon} size="sm" label={step.title} />
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <span className="font-semibold">۰{index + 1}</span>
                    <span>گام</span>
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
          className="order-1 relative flex h-full min-h-[420px] flex-col overflow-hidden px-8 pb-16 pt-20 text-right sm:px-12 lg:order-1 lg:px-20"
        >
          <div
            className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-b from-accent/50 via-transparent to-transparent"
            aria-hidden
          />
          <div
            className="absolute -right-32 top-0 h-64 w-64 rounded-full bg-accent/30 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-1 flex-col items-end gap-8">
            <Image
              src="/images/image 50.png"
              alt="Saayan"
              width={400}
              height={500}
              className="absolute -right-24 -top-16 w-[600px] z-20 h-auto pointer-events-none"
              priority
            />
            <motion.h1
              variants={titleVariants}
              initial="initial"
              animate="animate"
              className="relative z-10 max-w-3xl text-balance bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl lg:text-7xl"
            >
              سایـــــــــان نوبت{' '}
            </motion.h1>
            <motion.p
              variants={descriptionVariants}
              initial="initial"
              animate="animate"
              className="relative z-10 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              نوبت‌دهی راحت برای شما، تجربه‌ی حرفه‌ای برای بیماران.
            </motion.p>
            <motion.div
              variants={buttonsVariants}
              initial="initial"
              animate="animate"
              className="mt-auto flex flex-row-reverse flex-wrap items-center justify-end gap-4 pt-4"
            >
              <Link href={BOOKING_PATH}>
                <Button variant="primary" size="md">
                  رزرو نوبت
                </Button>
              </Link>
              <Link href="#steps">
                <Button variant="secondary" size="md">
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
