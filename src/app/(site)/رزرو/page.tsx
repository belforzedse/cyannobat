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
      className="glass flex flex-col gap-10 px-8 py-10 text-right sm:px-12"
    >
      <header className="flex flex-col items-end gap-3">
        <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs text-muted dark:bg-white/5">
          آغاز رزرو آنلاین
        </span>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">رزرو نوبت</h1>
        <p className="max-w-xl text-sm leading-7 text-muted">
          لطفاً اطلاعات مورد نیاز را تکمیل کنید تا گام‌های بعدی برای هماهنگی نوبت در اختیار شما قرار گیرد. این پیش‌نمایش تنها جهت نمایش رابط کاربری است.
        </p>
      </header>

      <form className="grid gap-6">
        <label className="flex flex-col items-end gap-2 text-sm">
          <span className="text-muted">انتخاب خدمت</span>
          <select className="w-full rounded-2xl border border-white/20 bg-white/40 px-4 py-3 text-right text-base text-foreground shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-white/10">
            <option>مشاوره عمومی</option>
            <option>ویزیت تخصص قلب</option>
            <option>چکاپ دوره‌ای</option>
          </select>
        </label>

        <label className="flex flex-col items-end gap-2 text-sm">
          <span className="text-muted">انتخاب پزشک</span>
          <select className="w-full rounded-2xl border border-white/20 bg-white/40 px-4 py-3 text-right text-base text-foreground shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-white/10">
            <option>دکتر نسرین حاتمی</option>
            <option>دکتر امید فرهی</option>
            <option>دکتر لیلا محمدی</option>
          </select>
        </label>

        <label className="flex flex-col items-end gap-2 text-sm">
          <span className="text-muted">تاریخ و زمان</span>
          <div className="grid gap-3 rounded-3xl border border-white/15 bg-white/20 p-4 text-right shadow-inner dark:border-white/10 dark:bg-white/10">
            <input
              type="date"
              className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-3 text-right text-base text-foreground shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-white/15"
            />
            <input
              type="time"
              className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-3 text-right text-base text-foreground shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-white/15"
            />
          </div>
        </label>
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
