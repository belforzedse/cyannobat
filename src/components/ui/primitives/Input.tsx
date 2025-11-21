'use client';

import React, { InputHTMLAttributes, forwardRef, useId } from 'react';
import clsx from 'clsx';

import { FieldShell } from './FieldShell';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const generatedId = id || `input-${reactId}`;

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
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          disabled={disabled}
        >
          <input
            ref={ref}
            id={generatedId}
            className={clsx(
              'flex-1 w-full border-none outline-none bg-transparent text-sm leading-6 px-4 py-[0.625rem] transition-colors duration-200 ease-glass text-right disabled:cursor-not-allowed',
              className,
            )}
            style={{ color: 'inherit', font: 'inherit', borderRadius: 'inherit' }}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            disabled={disabled}
            placeholder={props.placeholder || 'بنویسید...'}
            {...props}
          />
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

Input.displayName = 'Input';

export { Input, type InputProps };
