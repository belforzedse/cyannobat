import type { ReactNode } from 'react';
import clsx from 'clsx';

interface GlassCardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

const GlassCard = ({ title, description, children, className }: GlassCardProps) => {
  return (
    <article
      className={clsx(
        'glass group relative overflow-hidden p-6 text-right transition-all duration-500 ease-out hover:-translate-y-3 hover:shadow-2xl',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-3">
        {title ? <h3 className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-lg font-bold tracking-tight text-transparent">{title}</h3> : null}
        {description ? <p className="leading-relaxed text-sm text-muted">{description}</p> : null}
        {children}
      </div>
      <div className="pointer-events-none absolute -right-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-accent/30 blur-3xl opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-70" aria-hidden />
      <div className="pointer-events-none absolute -bottom-28 left-10 h-48 w-48 rounded-full bg-white/20 blur-[120px] opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-50 dark:bg-white/5" aria-hidden />
    </article>
  );
};

export default GlassCard;
