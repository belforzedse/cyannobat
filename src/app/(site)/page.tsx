'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import GlassButton from '@/components/GlassButton';
import GlassIcon from '@/components/GlassIcon';
import { Calendar, Search, Clock } from 'lucide-react';
import { BOOKING_PATH } from '@/lib/routes';
import { liquidSpring, liquidContainer, liquidEntrance, glassMorph } from '@/lib/animations';

const steps = [
  {
    title: 'انتخاب خدمت',
    description: 'از میان خدمات تخصصی و بسته‌های سفارشی‌شده، بهترین گزینه را برای نیاز خود برگزینید.',
    icon: Search,
  },
  {
    title: 'انتخاب پزشک',
    description: 'پزشک مورد اعتماد خود را بر اساس تخصص، امتیاز بیماران و تجربه حرفه‌ای انتخاب کنید.',
    icon: Calendar,
  },
  {
    title: 'تاریخ و زمان',
    description: 'زمان دلخواه را رزرو کنید و یادآورها را در لحظه دریافت نمایید.',
    icon: Clock,
  },
];

const HeroPage = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-16 pb-12">
      <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(260px,360px)_1fr] lg:items-stretch">
        <motion.section
          id="steps"
          initial={prefersReducedMotion ? undefined : 'hidden'}
          whileInView={prefersReducedMotion ? undefined : 'visible'}
          viewport={{ once: true, amount: 0.2 }}
          variants={liquidContainer}
          className="order-2 space-y-6 text-right lg:order-none lg:space-y-8"
        >
          {steps.map((step, index) => (
            <motion.div key={step.title} variants={liquidEntrance}>
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

        <motion.section
          initial={prefersReducedMotion ? 'initial' : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
          whileHover={prefersReducedMotion ? undefined : 'hover'}
          variants={!prefersReducedMotion ? { ...liquidEntrance, ...glassMorph } : undefined}
          transition={liquidSpring}
          className="glass order-1 relative flex h-full min-h-[420px] flex-col overflow-hidden px-8 pb-16 pt-20 text-right sm:px-12 lg:order-none lg:px-20"
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-full border border-white/25 bg-white/20 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-inner backdrop-blur-sm dark:bg-white/10"
            >
              سایان نوبت — cyannobat
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-3xl text-balance bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl lg:text-7xl"
            >
              سایان نوبت
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              رزرو نوبت سریع، ساده و شفاف؛ تجربه‌ای الهام‌گرفته از دقت و ظرافت
              طراحی اپل برای مدیریت درمان شما.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, ...liquidSpring }}
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

      <motion.section
        initial={{
          opacity: prefersReducedMotion ? 1 : 0,
          y: prefersReducedMotion ? 0 : 24,
        }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.6,
          ease: "easeOut",
        }}
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
