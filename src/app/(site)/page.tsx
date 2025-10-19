'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import GlassButton from '@/components/GlassButton';
import GlassIcon from '@/components/GlassIcon';
import { Calendar, Search, CheckCircle2 } from 'lucide-react';
import { BOOKING_PATH } from '@/lib/routes';
import { luxuryContainer, luxurySlideFade } from '@/lib/luxuryAnimations';

const steps = [
  {
    title: 'انتخاب خدمت',
    description: 'از میان خدمات تخصصی و بسته‌های سفارشی‌شده، بهترین گزینه را برای نیاز خود برگزینید.',
    icon: Search,
  },
  {
    title: 'انتخاب تاریخ و زمان',
    description: 'بازه دلخواه خود را از میان زمان‌های آزاد انتخاب کنید؛ ارائه‌دهنده مناسب با همان بازه هماهنگ است.',
    icon: Calendar,
  },
  {
    title: 'تایید جزئیات',
    description: 'اطلاعات تماس و خلاصه نوبت را مرور کنید و پیش از ثبت نهایی، همه چیز را یک‌جا تایید نمایید.',
    icon: CheckCircle2,
  },
];

const HeroPage = () => {
  const prefersReducedMotion = useReducedMotion();

  // Create performance-optimized luxury animations
  // Note: Blur is expensive but used ONLY on initial load, not continuous animations
  // Framer Motion uses GPU acceleration (transform + opacity) for smooth 60fps

  const heroCardVariants = luxurySlideFade('right', {
    distance: 32,
    duration: 0.9,
    scale: 0.96,        // Subtle scale (96% vs 95%)
    blur: 0,            // No blur for main card (performance)
    delayIn: 0.1,
  });

  const badgeVariants = luxurySlideFade('up', {
    distance: 16,
    duration: 0.8,
    scale: 0.98,
    blur: 0,            // No blur (performance)
    delayIn: 0.2,
  });

  const titleVariants = luxurySlideFade('up', {
    distance: 24,
    duration: 0.9,
    scale: 0.96,
    blur: 1,            // Minimal blur (1px) for premium feel
    delayIn: 0.3,
  });

  const descriptionVariants = luxurySlideFade('up', {
    distance: 16,
    duration: 1.0,
    scale: 0.98,
    blur: 0,
    delayIn: 0.4,
  });

  const buttonsVariants = luxurySlideFade('up', {
    distance: 16,
    duration: 1.0,
    scale: 0.98,
    blur: 0,
    delayIn: 0.5,
  });

  const bottomSectionVariants = luxurySlideFade('up', {
    distance: 32,
    duration: 1.0,
    scale: 0.96,
    blur: 0,            // No blur for scroll-triggered (performance)
    delayIn: 0,
  });

  return (
    <div className="flex flex-col gap-16 pb-12">
      <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[1fr_minmax(260px,360px)] lg:items-stretch">
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
              variants={
                prefersReducedMotion
                  ? undefined
                  : luxurySlideFade('right', {
                      distance: 32,
                      duration: 0.8,
                      scale: 0.96,
                      blur: 0,            // No blur for better performance
                      delayIn: index * 0.08 + 0.15,
                    })
              }
              initial={prefersReducedMotion ? undefined : 'initial'}
              animate={prefersReducedMotion ? undefined : 'animate'}
            >
              <GlassCard title={step.title} description={step.description} className="h-full">
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
        <motion.section
          variants={prefersReducedMotion ? undefined : heroCardVariants}
          initial={prefersReducedMotion ? undefined : 'initial'}
          animate={prefersReducedMotion ? undefined : 'animate'}
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                  y: -4,
                  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                }
          }
          className="glass order-1 relative flex h-full min-h-[420px] flex-col overflow-hidden px-8 pb-16 pt-20 text-right sm:px-12 lg:order-1 lg:px-20 will-change-transform"
        >
          <div
            className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-b from-accent/50 via-transparent to-transparent"
            aria-hidden
          />
          <div
            className="absolute -right-32 top-0 h-64 w-64 rounded-full bg-accent/30 blur-3xl"
            aria-hidden
          />
          <div className="flex flex-1 flex-col items-end gap-8">
            <motion.span
              variants={prefersReducedMotion ? undefined : badgeVariants}
              initial={prefersReducedMotion ? undefined : 'initial'}
              animate={prefersReducedMotion ? undefined : 'animate'}
              className="rounded-full border border-white/25 bg-white/20 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-inner backdrop-blur-sm dark:bg-white/10"
            >
              سایان نوبت — cyannobat
            </motion.span>
            <motion.h1
              variants={prefersReducedMotion ? undefined : titleVariants}
              initial={prefersReducedMotion ? undefined : 'initial'}
              animate={prefersReducedMotion ? undefined : 'animate'}
              className="max-w-3xl text-balance bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl lg:text-7xl"
            >
              سایان نوبت
            </motion.h1>
            <motion.p
              variants={prefersReducedMotion ? undefined : descriptionVariants}
              initial={prefersReducedMotion ? undefined : 'initial'}
              animate={prefersReducedMotion ? undefined : 'animate'}
              className="max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              رزرو نوبت سریع، ساده و شفاف؛ تجربه‌ای الهام‌گرفته از دقت و ظرافت
              طراحی اپل برای مدیریت درمان شما.
            </motion.p>
            <motion.div
              variants={prefersReducedMotion ? undefined : buttonsVariants}
              initial={prefersReducedMotion ? undefined : 'initial'}
              animate={prefersReducedMotion ? undefined : 'animate'}
              className="mt-auto flex flex-row-reverse flex-wrap items-center justify-end gap-4 pt-4"
            >
              <Link href={BOOKING_PATH}>
                <GlassButton variant="primary" size="md">
                  رزرو نوبت
                </GlassButton>
              </Link>
              <Link href="#steps">
                <GlassButton variant="secondary" size="md">
                  مشاهده مراحل
                </GlassButton>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Bottom Management Section */}
      <motion.section
        variants={prefersReducedMotion ? undefined : bottomSectionVariants}
        initial={prefersReducedMotion ? undefined : 'initial'}
        whileInView={prefersReducedMotion ? undefined : 'animate'}
        viewport={{ once: true, amount: 0.3 }}
        className="glass relative overflow-hidden px-8 py-10 text-right sm:px-12"
      >
        <div
          className="absolute left-0 top-0 h-32 w-32 -translate-x-12 -translate-y-12 rounded-full bg-accent-strong/20 blur-3xl"
          aria-hidden
        />
        <div className="flex flex-col items-end gap-3">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            مدیریت هوشمند نوبت‌دهی
          </h2>
          <p className="max-w-2xl text-balance text-base leading-8 text-muted-foreground">
            با داشبورد مدیریتی، گزارش‌های لحظه‌ای و ادغام‌پذیری با سامانه‌های
            درمانی، تیم شما هر لحظه بر عملکرد مطب و کلینیک نظارت خواهد داشت.
          </p>
        </div>
      </motion.section>
    </div>
  );
};

export default HeroPage;
