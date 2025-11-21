'use client';

import { TextareaHTMLAttributes, forwardRef, useEffect, useId, useState } from 'react';
import clsx from 'clsx';

import { FieldShell } from '../FieldShell';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  showCharCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      showCharCount = false,
      maxLength,
      id,
      disabled,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [charCount, setCharCount] = useState(typeof value === 'string' ? value.length : 0);

    useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    const reactId = useId();
    const generatedId = id || `textarea-${reactId}`;

    const describedBy = error
      ? `${generatedId}-error`
      : helperText
        ? `${generatedId}-helper`
        : undefined;

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(event.target.value.length);
      onChange?.(event);
    };

    const valueProps = value !== undefined ? { value } : {};

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={generatedId} className="text-sm font-medium text-right text-foreground">
            {label}
          </label>
        )}

        <FieldShell fullWidth={fullWidth} invalid={Boolean(error)} disabled={disabled}>
          <textarea
            ref={ref}
            id={generatedId}
            className="w-full border-none outline-none bg-transparent text-sm leading-6 px-4 py-3 resize-y min-h-[100px] transition-colors duration-200 ease-glass text-right disabled:cursor-not-allowed"
            style={{ color: 'inherit', font: 'inherit', borderRadius: 'inherit' }}
            maxLength={maxLength}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            disabled={disabled}
            onChange={handleChange}
            {...valueProps}
            {...props}
          />
        </FieldShell>

        <div className="flex items-center justify-between gap-2 mt-1">
          <div>
            {error ? (
              <p
                id={`${generatedId}-error`}
                className="text-xs leading-5 text-right text-red-500 animate-field-message-in"
              >
                {error}
              </p>
            ) : helperText ? (
              <p
                id={`${generatedId}-helper`}
                className="text-xs leading-5 text-right text-muted-foreground/90 animate-field-message-in"
              >
                {helperText}
              </p>
            ) : null}
          </div>

          {showCharCount && maxLength && (
            <p className="text-xs text-muted-foreground/90">
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea, type TextareaProps };
