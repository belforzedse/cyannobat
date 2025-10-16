'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

const steps = [
  {
    title: 'انتخاب خدمت',
    description: 'از میان خدمات تخصصی و بسته‌های سفارشی‌شده، بهترین گزینه را برای نیاز خود برگزینید.',
  },
  {
    title: 'انتخاب پزشک',
    description: 'پزشک مورد اعتماد خود را بر اساس تخصص، امتیاز بیماران و تجربه حرفه‌ای انتخاب کنید.',
  },
  {
    title: 'تاریخ و زمان',
    description: 'زمان دلخواه را رزرو کنید و یادآورها را در لحظه دریافت نمایید.',
  },
];

const HeroPage = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-16 pb-12">
      <motion.section
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: 'easeOut' }}
        className="glass relative overflow-hidden px-8 pb-12 pt-16 text-right sm:px-12 lg:px-16"
      >
        <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-accent/40 via-transparent to-transparent" aria-hidden />
        <div className="absolute -right-20 top-10 h-48 w-48 rounded-full bg-accent/25 blur-3xl" aria-hidden />
        <div className="flex flex-col items-end gap-6">
          <span className="rounded-full border border-white/25 bg-white/20 px-4 py-1 text-sm text-muted shadow-inner dark:bg-white/10">
            سایان نوبت — cyannobat
          </span>
          <h1 className="max-w-2xl text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            سایان نوبت
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted sm:text-xl">
            رزرو نوبت سریع، ساده و شفاف؛ تجربه‌ای الهام‌گرفته از دقت و ظرافت طراحی اپل برای مدیریت درمان شما.
          </p>
          <div className="flex flex-wrap items-center justify-end gap-4">
            <Link href="/رزرو" className="btn-primary text-base font-semibold">
              رزرو نوبت
            </Link>
            <Link href="#steps" className="btn-secondary">
              مشاهده مراحل
            </Link>
          </div>
        </div>
      </motion.section>

      <section id="steps" className="grid gap-6 text-right md:grid-cols-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: prefersReducedMotion ? 0 : index * 0.1, duration: prefersReducedMotion ? 0 : 0.5, ease: 'easeOut' }}
          >
            <GlassCard title={step.title} description={step.description} className="h-full">
              <div className="mt-4 flex items-center justify-end gap-2 text-sm text-accent">
                <span className="font-semibold">۰{index + 1}</span>
                <span>گام</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </section>

      <motion.section
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
        className="glass relative overflow-hidden px-8 py-10 text-right sm:px-12"
      >
        <div className="absolute left-0 top-0 h-32 w-32 -translate-x-12 -translate-y-12 rounded-full bg-accent-strong/20 blur-3xl" aria-hidden />
        <div className="flex flex-col items-end gap-3">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">مدیریت هوشمند نوبت‌دهی</h2>
          <p className="max-w-2xl text-balance text-base leading-8 text-muted">
            با داشبورد مدیریتی، گزارش‌های لحظه‌ای و ادغام‌پذیری با سامانه‌های درمانی، تیم شما هر لحظه بر عملکرد مطب و کلینیک نظارت خواهد داشت.
          </p>
        </div>
      </motion.section>
    </div>
  );
};

export default HeroPage;
