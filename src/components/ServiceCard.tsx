import type { ReactNode } from 'react';
import clsx from 'clsx';

interface ServiceCardProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  badge?: string;
  onClick?: () => void;
  isSelected?: boolean;
  className?: string;
}

const ServiceCard = ({
  icon,
  title,
  description,
  badge,
  onClick,
  isSelected = false,
  className,
}: ServiceCardProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'group relative flex flex-col gap-3 rounded-2xl border-2 p-5 text-right transition-all duration-300',
        'hover:shadow-lg hover:shadow-accent/20',
        isSelected
          ? 'border-accent bg-accent/10 shadow-lg shadow-accent/30'
          : 'border-white/20 bg-white/40 hover:border-accent/40 hover:bg-white/60',
        'dark:hover:shadow-accent/15',
        isSelected
          ? 'dark:border-accent/60 dark:bg-accent/5 dark:shadow-accent/20'
          : 'dark:border-white/10 dark:bg-white/10 dark:hover:border-accent/50 dark:hover:bg-white/15',
        className,
      )}
    >
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent dark:bg-accent/10">
          {badge}
        </span>
      )}

      {icon && <div className="text-2xl text-accent group-hover:scale-110 transition-transform duration-300">{icon}</div>}

      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors duration-300">{title}</h3>
        {description && <p className="text-sm text-muted/80 leading-relaxed">{description}</p>}
      </div>

      {isSelected && (
        <div className="mt-2 flex items-center justify-end gap-2 text-sm text-accent font-medium">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          انتخاب شد
        </div>
      )}
    </button>
  );
};

export default ServiceCard;
