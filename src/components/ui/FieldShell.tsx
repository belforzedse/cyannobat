'use client';

import { ReactElement, ReactNode, cloneElement } from 'react';
import clsx from 'clsx';

type FieldShellChild = ReactElement<{ className?: string; disabled?: boolean }>;

interface FieldShellProps {
  children: FieldShellChild;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}

const FieldShell = ({
  children,
  leftIcon,
  rightIcon,
  fullWidth = true,
  invalid = false,
  disabled,
  className,
}: FieldShellProps) => {
  const isDisabled = disabled ?? children.props.disabled ?? false;

  const childProps = children.props as Record<string, unknown>;

  const control = cloneElement(children, {
    className: clsx(
      'flex-1 w-full border-none bg-transparent px-4 py-[0.625rem] text-right text-sm leading-6 outline-none transition-colors duration-200 ease-glass disabled:cursor-not-allowed',
      leftIcon && 'pr-10',
      rightIcon && 'pl-10',
      typeof childProps.className === 'string' ? childProps.className : '',
    ),
    style: {
      color: 'inherit',
      font: 'inherit',
      borderRadius: 'inherit',
      ...(typeof childProps.style === 'object' && childProps.style
        ? (childProps.style as Record<string, unknown>)
        : {}),
    },
  } as Record<string, unknown>);

  return (
    <div
      className={clsx(
        'relative flex items-center rounded-md border text-foreground backdrop-blur-[16px] transition-[border-color,box-shadow,background-color] duration-200 ease-glass',
        fullWidth && 'w-full',
        !invalid &&
          'border-border/45 bg-[rgba(var(--glass-rgb),0.62)] hover:border-border/60 hover:bg-[rgba(var(--glass-rgb),0.72)] focus-within:border-accent focus-within:bg-[rgba(var(--glass-rgb),0.78)] focus-within:shadow-[0_0_0_2px_rgba(var(--ring-rgb),0.35)]',
        invalid &&
          'border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.28)] focus-within:border-red-500 focus-within:shadow-[0_0_0_2px_rgba(239,68,68,0.32)]',
        isDisabled && 'cursor-not-allowed opacity-60',
        className,
      )}
      data-invalid={invalid ? 'true' : undefined}
      data-disabled={isDisabled ? 'true' : undefined}
    >
      {leftIcon ? (
        <span
          className="pointer-events-none absolute top-1/2 left-3 inline-flex -translate-y-1/2 items-center justify-center text-muted-foreground/90"
          aria-hidden="true"
        >
          {leftIcon}
        </span>
      ) : null}

      {control}

      {rightIcon ? (
        <span
          className="pointer-events-none absolute top-1/2 right-3 inline-flex -translate-y-1/2 items-center justify-center text-muted-foreground/90"
          aria-hidden="true"
        >
          {rightIcon}
        </span>
      ) : null}
    </div>
  );
};

FieldShell.displayName = 'FieldShell';

export { FieldShell, type FieldShellProps };
