'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { glassMorph, liquidEntrance } from '@/lib/animations';

interface GlassCardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

const GlassCard = ({ title, description, children, className }: GlassCardProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={shouldReduceMotion ? 'initial' : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'visible'}
      whileHover={shouldReduceMotion ? undefined : 'hover'}
      whileTap={shouldReduceMotion ? undefined : 'tap'}
      viewport={{ once: true, margin: '-50px' }}
      variants={!shouldReduceMotion ? { ...liquidEntrance, ...glassMorph } : undefined}
      className={clsx('glass relative overflow-hidden p-6 text-right group', className)}
    >
      <div className="relative z-10 flex flex-col gap-3">
        {title ? (
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-lg font-bold tracking-tight text-transparent"
          >
            {title}
          </motion.h3>
        ) : null}
        {description ? (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="leading-relaxed text-sm text-muted-foreground"
          >
            {description}
          </motion.p>
        ) : null}
        {children}
      </div>
      {/* Liquid glass glow effects */}
      <div
        className={clsx(
          'pointer-events-none absolute -right-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-accent/30 blur-3xl opacity-0',
          !shouldReduceMotion && 'transition-opacity duration-700 ease-out group-hover:opacity-70'
        )}
        aria-hidden
      />
      <div
        className={clsx(
          'pointer-events-none absolute -bottom-28 left-10 h-48 w-48 rounded-full bg-white/20 blur-[120px] opacity-0 dark:bg-white/5',
          !shouldReduceMotion && 'transition-opacity duration-700 ease-out group-hover:opacity-50'
        )}
        aria-hidden
      />
    </motion.article>
  );
};

export default GlassCard;
