'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

const BookingPage = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="glass flex flex-col gap-12 px-8 py-12 text-right sm:px-12 lg:px-16"
    >
      <header className="flex flex-col items-end gap-4">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-muted backdrop-blur-sm dark:bg-white/5"
        >
          آغاز رزرو آنلاین
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
        >
          رزرو نوبت
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-2xl text-balance leading-relaxed text-muted"
        >
          لطفاً اطلاعات مورد نیاز را تکمیل کنید تا گام‌های بعدی برای هماهنگی نوبت در اختیار شما قرار گیرد. این پیش‌نمایش تنها جهت نمایش رابط کاربری است.
        </motion.p>
      </header>

      <form className="grid gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <label className="flex flex-col items-end gap-2.5">
            <span className="text-sm font-medium text-muted">انتخاب خدمت</span>
            <select className="w-full rounded-xl border border-white/20 bg-white/40 px-4 py-2.5 text-right text-base text-foreground shadow-inner transition-all duration-300 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-white/10">
              <option>مشاوره عمومی</option>
              <option>ویزیت تخصص قلب</option>
              <option>چکاپ دوره‌ای</option>
            </select>
          </label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <label className="flex flex-col items-end gap-2.5">
            <span className="text-sm font-medium text-muted">انتخاب پزشک</span>
            <select className="w-full rounded-xl border border-white/20 bg-white/40 px-4 py-2.5 text-right text-base text-foreground shadow-inner transition-all duration-300 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-white/10">
              <option>دکتر نسرین حاتمی</option>
              <option>دکتر امید فرهی</option>
              <option>دکتر لیلا محمدی</option>
            </select>
          </label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <label className="flex flex-col items-end gap-2.5">
            <span className="text-sm font-medium text-muted">تاریخ و زمان</span>
            <div className="grid gap-3 rounded-2xl border border-white/15 bg-white/20 p-4 text-right shadow-inner dark:border-white/10 dark:bg-white/10">
              <input
                type="date"
                className="w-full rounded-xl border border-white/20 bg-white/60 px-4 py-2.5 text-right text-base text-foreground shadow-inner transition-all duration-300 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-white/15"
              />
              <input
                type="time"
                className="w-full rounded-xl border border-white/20 bg-white/60 px-4 py-2.5 text-right text-base text-foreground shadow-inner transition-all duration-300 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-white/15"
              />
            </div>
          </label>
        </motion.div>
      </form>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link href="/" className="btn-secondary">
          بازگشت
        </Link>
        <button type="button" className="btn-primary">
          ادامه
        </button>
      </div>
    </motion.section>
  );
};

export default BookingPage;
