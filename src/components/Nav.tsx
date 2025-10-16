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
      className="glass sticky top-4 z-40 flex items-center justify-between px-6 py-3 text-right"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2rem bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-30 -z-10 dark:via-white/10"
        aria-hidden
      />
      <div className="flex items-center gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-white/65 via-accent/35 to-accent-strong/50 text-foreground shadow-inner backdrop-blur-xl dark:from-white/15 dark:via-accent/25 dark:to-accent-strong/45">
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
          className="glass-pill hidden px-5 py-2 text-sm font-medium text-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline-flex"
        >
          رزرو نوبت
        </Link>
        <ThemeToggle />
      </div>
    </motion.header>
  );
};

export default Nav;
