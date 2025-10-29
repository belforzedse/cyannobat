'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { luxuryPresets } from '@/lib/luxuryAnimations';
import { GlassSurface } from '@/components/ui/glass';

interface GlassCardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

const GlassCard = ({ title, description, children, className }: GlassCardProps) => {
  const shouldReduceMotion = useReducedMotion();

  // Simplified entrance animation only (no hover for performance)
  const cardVariants = shouldReduceMotion ? undefined : luxuryPresets.whisper('up');

  return (
    <GlassSurface
      as={motion.article}
      interactive={!shouldReduceMotion}
      initial={shouldReduceMotion ? undefined : 'initial'}
      whileInView={shouldReduceMotion ? undefined : 'animate'}
      viewport={{ once: true, margin: '-50px' }}
      variants={cardVariants}
      className={clsx(
        'relative overflow-hidden p-6 text-right group',
        'transition-transform duration-300 ease-out hover:-translate-y-1',
        className
      )}
    >
      <div className="relative z-10 flex flex-col gap-3">
        {title ? (
          <h3
            className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-lg font-bold tracking-tight text-transparent"
            style={{
              animation: shouldReduceMotion ? undefined : 'fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards',
            }}
          >
            {title}
          </h3>
        ) : null}
        {description ? (
          <p
            className="leading-relaxed text-sm text-muted-foreground"
            style={{
              animation: shouldReduceMotion ? undefined : 'fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s backwards',
            }}
          >
            {description}
          </p>
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
    </GlassSurface>
  );
};

export default GlassCard;
