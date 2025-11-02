'use client';

import { Fragment, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui';
import { GlassSurface } from '@/components/ui/glass';
import { Calendar, Search, CheckCircle2, type LucideIcon } from 'lucide-react';
import { BOOKING_PATH } from '@/lib/routes';
import { luxuryContainer, luxurySlideFade } from '@/lib/luxuryAnimations';
import { ArrowLeft } from 'lucide-react';

type Step = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const steps: Step[] = [
  {
    title: 'انتخاب خدمت',
    description: `بیمار نوع خدمت مورد نظرش رو از لیست خدمات مطب یا کلینیک انتخاب می‌کنه
(مثلاً ویزیت عمومی، زیبایی، ارتودنسی و...).`,
    icon: Search,
  },
  {
    title: 'انتخاب تاریخ و زمان',
    description: `با مشاهده‌ی تقویم پزشک، کاربر روز و ساعت مناسب خودش رو انتخاب می‌کنه —
بدون نیاز به تماس تلفنی یا هماهنگی منشی`,
    icon: Calendar,
  },
  {
    title: 'تأیید جزئیات',
    description: `بیمار اطلاعات خودش رو وارد و نوبت رو تأیید می‌کنه.
در پایان، پیام یادآوری از طریق SMS یا واتساپ برای او ارسال می‌شود.`,
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
        {/* Steps Section (title + description) */}
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
                    <span className="relative inline-grid h-8 w-8 place-items-center">
                      {/* glow layer (behind) */}
                      <step.icon
                        aria-hidden
                        className="col-start-1 row-start-1 h-6 w-6 text-accent/70 opacity-80 blur-[1px] drop-shadow-[0_6px_18px_rgba(76,139,234,0.35)]"
                        strokeWidth={2.6}
                      />
                      {/* crisp layer (front) */}
                      <step.icon
                        aria-hidden
                        className="col-start-1 row-start-1 h-6 w-6 text-white/95 drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)]"
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

        {/* Hero Card Section */}
        <GlassSurface
          as={motion.section}
          variants={heroCardVariants}
          initial="initial"
          animate="animate"
          className="
    order-1 relative isolate overflow-hidden
    min-h-[460px] rounded-[28px]
    px-8 pb-16 pt-16 text-right sm:px-12 lg:order-1 lg:px-20

    /* LIGHT */
    bg-[linear-gradient(145deg,#EEF3FA_0%,#E5EDF9_45%,#D6E2F5_100%)]
    ring-1 ring-slate-900/5 border border-slate-200
    shadow-[0_16px_44px_-28px_rgba(16,24,40,0.22),inset_0_1px_0_rgba(255,255,255,0.6)]

    /* DARK */
    dark:bg-[linear-gradient(145deg,hsl(222,30%,16%),hsl(219,36%,22%))]
    dark:ring-white/10 dark:border-white/10
    dark:shadow-[0_22px_60px_-24px_rgba(10,14,20,0.9),inset_0_1px_0_rgba(255,255,255,0.06)]
  "
        >
          {/* top highlight */}
          <div
            className="
      pointer-events-none absolute inset-x-0 -top-24 h-48
      bg-gradient-to-b from-white/80 to-transparent
      dark:from-white/12
    "
            aria-hidden
          />
          {/* right glow + soft vignette — DARK ONLY */}
          <div
            className="
    absolute inset-0 hidden dark:block pointer-events-none
    dark:bg-[radial-gradient(80%_70%_at_88%_22%,rgba(76,139,234,0.45),transparent_60%),
              radial-gradient(60%_50%_at_12%_90%,rgba(255,255,255,0.10),transparent_60%)]
    dark:[mask-image:radial-gradient(130%_120%_at_50%_0%,#000_40%,transparent_100%)]
  "
            aria-hidden
          />

          {/* bottom contrast fade — DARK ONLY */}
          <div
            className="
    absolute inset-x-0 bottom-0 hidden dark:block pointer-events-none h-1/2
    dark:bg-gradient-to-b dark:from-transparent dark:via-black/35 dark:to-black/60
  "
            aria-hidden
          />

          <div className="relative z-10 flex flex-1 flex-col items-end gap-6">
            <Image
              src="/images/image 50.png"
              alt="Saayan"
              width={640}
              height={760}
              priority
              className="
        pointer-events-none absolute -right-12 -top-10 h-auto w-[600px]
        sm:w-[620px] lg:w-[640px]
        drop-shadow-[0_18px_60px_rgba(6,12,20,0.35)]
        dark:drop-shadow-[0_18px_60px_rgba(6,12,20,0.55)]
      "
            />

            <motion.h1
              variants={titleVariants}
              initial="initial"
              animate="animate"
              className="
        relative max-w-3xl text-balance
        bg-gradient-to-b from-[#5EA2FF] to-[#3372C8] bg-clip-text text-transparent
        text-5xl font-extrabold leading-tight tracking-[.01em]
        sm:text-6xl lg:text-7xl
        drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]
        dark:from-[#7AB4FF] dark:to-[#4A8BEA] dark:drop-shadow-[0_1px_0_rgba(255,255,255,0.18)]
      "
            >
              سایـــــــــان نوبت
            </motion.h1>

            <motion.p
              variants={descriptionVariants}
              initial="initial"
              animate="animate"
              className="
        relative max-w-2xl text-balance text-base leading-7
        text-slate-700/85 sm:text-lg
        dark:text-white/80
      "
            >
              نوبت‌دهی راحت برای شما، تجربه‌ی حرفه‌ای برای بیماران.
            </motion.p>

            <motion.div
              variants={buttonsVariants}
              initial="initial"
              animate="animate"
              className="mt-auto flex flex-row-reverse flex-wrap items-center justify-end gap-3 pt-4"
            >
              {/* Primary (theme-aware) */}
              <Link href={BOOKING_PATH}>
                <Button
                  variant="ghost"
                  size="md"
                  className="
            group rounded-full px-5 py-3 text-sm sm:text-base
            bg-white text-[#2F64A7]
            border border-slate-200 ring-1 ring-slate-900/5
            hover:bg-slate-50 hover:ring-slate-900/10
            shadow-[0_6px_18px_-10px_rgba(16,24,40,0.22)]
            dark:bg-white/12 dark:text-white/95
            dark:border-white/25 dark:ring-white/15
            dark:hover:bg-white/16
            dark:shadow-[0_10px_28px_-14px_rgba(68,132,230,0.55)]
            backdrop-blur-md
          "
                >
                  <span className="flex items-center gap-2">
                    رزرو نوبت
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </Button>
              </Link>

              {/* Secondary */}
              <Link href="#steps">
                <Button
                  variant="ghost"
                  size="md"
                  className="
            rounded-full px-5 py-3 text-sm sm:text-base
            bg-slate-50 text-slate-700
            border border-slate-200 ring-1 ring-slate-900/5
            hover:bg-white hover:ring-slate-900/10
            dark:bg-white/8 dark:text-white/90
            dark:border-white/20 dark:ring-white/10
            dark:hover:bg-white/12
            backdrop-blur-md
          "
                >
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
