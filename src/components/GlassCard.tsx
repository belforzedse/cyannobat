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
        'glass group relative overflow-hidden p-6 text-right transition-transform duration-500 ease-out hover:-translate-y-1 hover:shadow-xl',
        accent && 'before:absolute before:inset-x-12 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-accent before:via-accent-strong before:to-accent/60',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-3">
        {title ? <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3> : null}
        {description ? <p className="leading-relaxed text-sm text-muted/90">{description}</p> : null}
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-accent/10 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />
    </article>
  );
};

export default GlassCard;
