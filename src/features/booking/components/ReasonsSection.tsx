'use client';

import clsx from 'clsx';
import { type ReasonOption } from '../types';

const cardClasses =
  'rounded-2xl sm:rounded-3xl border border-white/25 bg-white/45 p-4 sm:p-5 lg:p-6 shadow-[0_18px_40px_-28px_rgba(31,38,135,0.3)] backdrop-blur-sm dark:border-white/10 dark:bg-black/50';

type ReasonsSectionProps = {
  options: readonly ReasonOption[];
  selectedReasons: string[];
  onToggleReason: (value: string) => void;
  additionalReason: string;
  onAdditionalReasonChange: (value: string) => void;
};

const ReasonsSection = ({
  options,
  selectedReasons,
  onToggleReason,
  additionalReason,
  onAdditionalReasonChange,
}: ReasonsSectionProps) => (
  <div className={cardClasses}>
    <div className="flex flex-col items-end gap-1 sm:gap-2 text-right">
      <h3 className="text-sm font-semibold text-foreground">دلیل مراجعه</h3>
      <p className="text-xs leading-6 text-muted-foreground">
        یکی از گزینه‌های زیر را انتخاب کنید یا توضیح کوتاهی درباره‌ی نیاز خود بنویسید.
      </p>
    </div>
    <div className="mt-3 sm:mt-4 lg:mt-5 grid gap-2 sm:gap-3 sm:grid-cols-2">
      {options.map((reason) => {
        const isSelected = selectedReasons.includes(reason.value);
        return (
          <button
            type="button"
            key={reason.value}
            onClick={() => onToggleReason(reason.value)}
            className={clsx(
              'flex w-full flex-row-reverse items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-right shadow-sm transition-all duration-200',
              'hover:border-accent/60 hover:bg-accent/10 dark:hover:border-accent/50 dark:hover:bg-accent/10',
              isSelected
                ? 'border-accent/70 bg-accent/20 text-foreground shadow-[0_12px_28px_-22px_rgba(88,175,192,0.75)] dark:border-accent/60'
                : 'border-white/25 bg-white/45 text-muted-foreground dark:border-white/15 dark:bg-black/40',
            )}
          >
            <span className="text-sm font-medium">{reason.label}</span>
            <span
              className={clsx(
                'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                isSelected
                  ? 'border-accent/70 bg-accent text-slate-900'
                  : 'border-white/30 bg-white/40 text-muted-foreground dark:border-white/20 dark:bg-black/30',
              )}
              aria-hidden
            >
              {isSelected ? '✓' : '۰'}
            </span>
          </button>
        );
      })}
    </div>
    <div className="mt-4 sm:mt-5 lg:mt-6 flex flex-col gap-2">
      <label htmlFor="additional-reason" className="text-sm font-medium text-foreground text-right">
        توضیحات تکمیلی
      </label>
      <textarea
        id="additional-reason"
        value={additionalReason}
        onChange={(event) => onAdditionalReasonChange(event.target.value)}
        className="min-h-[120px] w-full rounded-xl border border-white/20 bg-white/50 px-4 py-3 text-right text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 hover:border-white/30 hover:bg-white/60 focus:border-accent focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/12 dark:bg-white/10 dark:hover:border-white/20 dark:hover:bg-white/15 dark:focus:border-accent/50 dark:focus:bg-white/20"
        placeholder="در صورت نیاز جزئیات بیشتری را بنویسید"
      />
    </div>
  </div>
);

export default ReasonsSection;
