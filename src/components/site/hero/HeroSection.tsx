'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui';
import { GlassSurface } from '@/components/ui/glass';
import { BOOKING_PATH } from '@/lib/routes';
import { luxurySlideFade } from '@/lib/animation';

interface HeroSectionProps {
  className?: string;
}

export const HeroSection = ({ className }: HeroSectionProps) => {
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

  const heroCardVariants = configureSlideFade('right', {
    distance: 32,
    duration: 0.9,
    scale: 0.96,
    blur: 0,
    delayIn: 0.1,
  });

  const titleVariants = configureSlideFade('up', {
    distance: 24,
    duration: 0.9,
    scale: 0.96,
    blur: 1,
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
    <GlassSurface
      as={motion.section}
      variants={heroCardVariants}
      initial="initial"
      animate="animate"
      interactive={false}
      className={className}
    >
      {/* Light bending border effect - top and sides */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[2rem] dark:hidden"
        style={{
          background:
            'linear-gradient(to bottom, rgba(216,230,248,0.45) 0%, transparent 8%), linear-gradient(to right, rgba(224,236,249,0.22) 0%, transparent 2%, transparent 98%, rgba(211,230,245,0.13) 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, 1px, transparent 1px), linear-gradient(to right, 1px, transparent 1px, transparent calc(100% - 1px), 1px)',
          maskImage:
            'linear-gradient(to bottom, 1px, transparent 1px), linear-gradient(to right, 1px, transparent 1px, transparent calc(100% - 1px), 1px)',
          borderRadius: '2rem',
        }}
        aria-hidden
      />

      {/* Top highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-white/80 to-transparent dark:from-white/12"
        aria-hidden
      />

      {/* Right glow + soft vignette — DARK ONLY */}
      <div
        className="absolute inset-0 hidden dark:block pointer-events-none dark:bg-[radial-gradient(80%_70%_at_88%_22%,rgba(76,139,234,0.45),transparent_60%),radial-gradient(60%_50%_at_12%_90%,rgba(255,255,255,0.10),transparent_60%)] dark:[mask-image:radial-gradient(130%_120%_at_50%_0%,#000_40%,transparent_100%)]"
        aria-hidden
      />

      {/* Bottom contrast fade — DARK ONLY */}
      <div
        className="absolute inset-x-0 bottom-0 hidden dark:block pointer-events-none h-1/2 dark:bg-gradient-to-b dark:from-transparent dark:via-black/35 dark:to-black/60"
        aria-hidden
      />

      <Image
        src="/images/image 50.png"
        alt="Saayan"
        width={640}
        height={760}
        priority
        className="pointer-events-none absolute right-4 z-50 -top-2 bottom-5 h-auto w-[580px] sm:w-[600px] lg:w-[620px] dark:drop-shadow-[0_18px_60px_rgba(6,12,20,0.55)]"
      />

      <div className="relative z-10 flex flex-1 flex-col ml-14 mt-40 items-end">
        <div className="flex flex-col items-end gap-6">
          <motion.h1
            variants={titleVariants}
            initial="initial"
            animate="animate"
            className="relative max-w-3xl text-5xl tracking-[.01em] sm:text-6xl drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] font-rokh font-[800] dark:text-[#4798E3] text-[#5C7299] dark:drop-shadow-[0_1px_0_rgba(255,255,255,0.18)]"
          >
            سایـــــــــان نوبت{' '}
          </motion.h1>

          <motion.p
            variants={descriptionVariants}
            initial="initial"
            animate="animate"
            className="relative max-w-2xl text-balance text-sm leading-7 text-slate-700/85 font-semibold sm:text-xl dark:text-white/80"
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
                className="group rounded-full px-5 py-3 text-sm sm:text-base bg-white text-[#2F64A7] border border-slate-200 ring-1 ring-slate-900/5 hover:bg-slate-50 hover:ring-slate-900/10 shadow-[0_6px_18px_-10px_rgba(16,24,40,0.22)] dark:bg-white/12 dark:text-white/95 dark:border-white/25 dark:ring-white/15 dark:hover:bg-white/16 dark:shadow-[0_10px_28px_-14px_rgba(68,132,230,0.55)] backdrop-blur-md"
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
                className="rounded-full px-5 py-3 text-sm sm:text-base bg-slate-50 text-slate-700 border border-slate-200 ring-1 ring-slate-900/5 hover:bg-white hover:ring-slate-900/10 dark:bg-white/8 dark:text-white/90 dark:border-white/20 dark:ring-white/10 dark:hover:bg-white/12 backdrop-blur-md"
              >
                مشاهده مراحل
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </GlassSurface>
  );
};
