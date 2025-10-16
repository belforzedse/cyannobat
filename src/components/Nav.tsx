'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Nav = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.header
      initial={{ y: prefersReducedMotion ? 0 : -24, opacity: prefersReducedMotion ? 1 : 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="sticky top-4 z-40 flex items-center justify-between rounded-3xl border border-white/15 bg-white/20 px-6 py-3 text-right shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/10"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/70 via-white/40 to-accent-strong/70 text-foreground shadow-inner">
          <span className="text-lg font-bold">س</span>
        </div>
        <div className="flex flex-col">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            سایان نوبت
          </Link>
          <span className="text-xs text-muted">cyannobat</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/رزرو"
          className="hidden rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent sm:inline-flex"
        >
          رزرو نوبت
        </Link>
        <ThemeToggle />
      </div>
    </motion.header>
  );
};

export default Nav;
