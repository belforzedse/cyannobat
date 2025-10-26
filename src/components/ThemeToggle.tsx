'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { liquidSpring, rippleEffect } from '@/lib/animations';

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const buttonClassName =
    "group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/30 text-foreground shadow-lg backdrop-blur-xl transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-black/80";

  if (!mounted) {
    return (
      <button aria-label="تغییر حالت نمایش" className={buttonClassName} type="button">
        <span className="sr-only">تغییر حالت نمایش</span>
        <span aria-hidden="true" className="flex items-center justify-center">
          <Moon className="h-5 w-5" aria-hidden="true" />
        </span>
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <motion.button
      aria-label="تغییر حالت نمایش"
      className={buttonClassName}
      type="button"
      onClick={toggle}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.08, rotate: 15 }}
      whileTap={prefersReducedMotion ? undefined : { ...rippleEffect, rotate: -10 }}
      transition={liquidSpring}
    >
      <span className="sr-only">تغییر حالت نمایش</span>
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={resolvedTheme}
          initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.5, rotate: prefersReducedMotion ? 0 : -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.5, rotate: prefersReducedMotion ? 0 : 90 }}
          transition={prefersReducedMotion ? { duration: 0 } : liquidSpring}
          className="flex items-center justify-center"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
