'use client';

import { SelectHTMLAttributes, forwardRef, useId } from 'react';
import clsx from 'clsx';

import { FieldShell } from './FieldShell';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

const ChevronDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      fullWidth = true,
      className,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const generatedId = id || `select-${reactId}`;

    const describedBy = error
      ? `${generatedId}-error`
      : helperText
        ? `${generatedId}-helper`
        : undefined;

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={generatedId} className="text-sm font-medium text-right text-foreground">
            {label}
          </label>
        )}

        <FieldShell
          fullWidth={fullWidth}
          invalid={Boolean(error)}
          leftIcon={<ChevronDown />}
          disabled={disabled}
        >
          <select
            ref={ref}
            id={generatedId}
            className={clsx(
              'flex-1 w-full border-none outline-none bg-transparent text-sm leading-6 px-4 py-[0.625rem] appearance-none cursor-pointer transition-colors duration-200 ease-glass text-right disabled:cursor-not-allowed',
              className,
            )}
            style={{ color: 'inherit', font: 'inherit', borderRadius: 'inherit' }}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldShell>

        {error ? (
          <p
            id={`${generatedId}-error`}
            className="text-xs leading-5 text-right text-red-500 animate-field-message-in mt-1"
          >
            {error}
          </p>
        ) : helperText ? (
          <p
            id={`${generatedId}-helper`}
            className="text-xs leading-5 text-right text-muted-foreground/90 animate-field-message-in mt-1"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select, type SelectProps, type SelectOption };
