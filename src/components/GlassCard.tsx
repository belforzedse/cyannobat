import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

interface GlassCardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  ambient?: boolean;
}

const GlassCard = ({ title, description, children, className, ambient = false }: GlassCardProps) => {
  const shouldReduceMotion = useReducedMotion();
  const allowMotion = !shouldReduceMotion;

  return (
    <article
      className={clsx(
        'glass relative overflow-hidden p-6 text-right',
        allowMotion && 'group transition-all duration-500 ease-out hover:-translate-y-3 hover:shadow-2xl',
        className,
      )}
    >
      {ambient ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-accent/35 via-white/20 to-transparent opacity-40 blur-2xl mix-blend-screen"
          initial={allowMotion ? { opacity: 0.2, scale: 0.95 } : { opacity: 0.35, scale: 1 }}
          animate={
            allowMotion
              ? {
                  opacity: [0.35, 0.55, 0.35],
                  scale: [0.98, 1.04, 0.98],
                }
              : { opacity: 0.35, scale: 1 }
          }
          transition={
            allowMotion
              ? {
                  duration: 10,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : undefined
          }
        />
      ) : null}
      <div className="relative z-10 flex flex-col gap-3">
        {title ? <h3 className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-lg font-bold tracking-tight text-transparent">{title}</h3> : null}
        {description ? <p className="leading-relaxed text-sm text-muted">{description}</p> : null}
        {children}
      </div>
      <div
        className={clsx(
          'pointer-events-none absolute -right-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-accent/30 blur-3xl opacity-0',
          allowMotion && 'transition-opacity duration-700 ease-out group-hover:opacity-70',
        )}
        aria-hidden
      />
      <div
        className={clsx(
          'pointer-events-none absolute -bottom-28 left-10 h-48 w-48 rounded-full bg-white/20 blur-[120px] opacity-0 dark:bg-white/5',
          allowMotion && 'transition-opacity duration-700 ease-out group-hover:opacity-50',
        )}
        aria-hidden
      />
    </article>
  );
};

export default GlassCard;
