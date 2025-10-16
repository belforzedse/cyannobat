import type { ReactNode } from 'react';
import clsx from 'clsx';

interface GlassCardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  accent?: boolean;
}

const GlassCard = ({ title, description, children, className, accent = false }: GlassCardProps) => {
  return (
    <article
      className={clsx(
        'glass glass-interactive group relative p-6 text-right transition-transform duration-500 ease-out hover:-translate-y-1',
        accent && 'before:absolute before:inset-x-12 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-accent before:via-accent-strong before:to-accent/60',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-3">
        {title ? <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3> : null}
        {description ? <p className="leading-relaxed text-sm text-muted/90">{description}</p> : null}
        {children}
      </div>
      <div className="pointer-events-none absolute -right-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-accent/35 blur-3xl opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-80 dark:bg-accent-strong/45" aria-hidden />
      <div className="pointer-events-none absolute -bottom-28 left-10 h-48 w-48 rounded-full bg-white/40 blur-[120px] opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-60 dark:bg-white/10" aria-hidden />
    </article>
  );
};

export default GlassCard;
