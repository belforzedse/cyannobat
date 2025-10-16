import type { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface BookingSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: Array<{ value: string; label: string }>;
}

const BookingSelect = ({ label, error, helper, options, className, ...props }: BookingSelectProps) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-foreground text-right">{label}</label>}
      <div className="relative">
        <select
          className={clsx(
            'w-full rounded-xl border border-white/20 bg-white/50 px-4 py-2.5 pr-10',
            'text-right text-base text-foreground',
            'transition-all duration-200 appearance-none cursor-pointer',
            'hover:bg-white/60 hover:border-white/30',
            'focus:bg-white/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50',
            'dark:bg-white/10 dark:border-white/15',
            'dark:hover:bg-white/15 dark:hover:border-white/25',
            'dark:focus:bg-white/20 dark:focus:border-accent/60 dark:focus:ring-accent/40',
            error && 'border-red-400/60 focus:ring-red-400/50',
            className,
          )}
          {...props}
        >
          <option value="" disabled selected>
            {label ? 'انتخاب کنید' : 'Select...'}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
      {helper && !error && <p className="text-xs text-muted text-right">{helper}</p>}
      {error && <p className="text-xs text-red-400/90 text-right">{error}</p>}
    </div>
  );
};

export default BookingSelect;
