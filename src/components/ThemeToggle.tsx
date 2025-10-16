'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="تغییر حالت نمایش"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/20 text-foreground backdrop-blur-lg transition"
        type="button"
      >
        <span className="sr-only">تغییر حالت نمایش</span>
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      aria-label="تغییر حالت نمایش"
      className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/30 text-foreground shadow-lg backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-white/10"
      type="button"
      onClick={toggle}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={resolvedTheme}
          initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 1.1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
