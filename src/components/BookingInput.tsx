import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';
import clsx from 'clsx';

interface BookingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const BookingInput = ({ label, error, helper, className, id, name, ...props }: BookingInputProps) => {
  const generatedId = useId();
  const fieldId = id ?? name ?? generatedId;
  const helperId = helper && !error ? `${fieldId}-helper` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const { ['aria-describedby']: ariaDescribedBy, ...restProps } = props;
  const describedBy = [ariaDescribedBy, helperId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground text-right">
          {label}
        </label>
      )}
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
        id={fieldId}
        name={name}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : undefined}
        {...restProps}
      />
      {helper && !error && (
        <p id={helperId} className="text-xs text-muted text-right">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-red-400/90 text-right">
          {error}
        </p>
      )}
    </div>
  );
};

export default BookingInput;
