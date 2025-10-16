import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface BookingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const BookingInput = ({ label, error, helper, className, ...props }: BookingInputProps) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-foreground text-right">{label}</label>}
      <input
        className={clsx(
          'w-full rounded-xl border border-white/20 bg-white/50 px-4 py-2.5',
          'text-right text-base text-foreground placeholder:text-muted/70',
          'transition-all duration-200',
          'hover:bg-white/60 hover:border-white/30',
          'focus:bg-white/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50',
          'dark:bg-white/10 dark:border-white/15',
          'dark:hover:bg-white/15 dark:hover:border-white/25',
          'dark:focus:bg-white/20 dark:focus:border-accent/60 dark:focus:ring-accent/40',
          error && 'border-red-400/60 focus:ring-red-400/50',
          className,
        )}
        {...props}
      />
      {helper && !error && <p className="text-xs text-muted text-right">{helper}</p>}
      {error && <p className="text-xs text-red-400/90 text-right">{error}</p>}
    </div>
  );
};

export default BookingInput;
