'use client'

import { ReactElement, ReactNode, cloneElement } from 'react'
import clsx from 'clsx'

import styles from './FieldShell.module.css'

type FieldShellChild = ReactElement<{ className?: string; disabled?: boolean }>

interface FieldShellProps {
  children: FieldShellChild
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  invalid?: boolean
  disabled?: boolean
  className?: string
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
  const isDisabled = disabled ?? children.props.disabled ?? false

  const control = cloneElement(children, {
    className: clsx(
      styles.control,
      leftIcon && styles.withLeftIcon,
      rightIcon && styles.withRightIcon,
      children.props.className
    ),
  })

  return (
    <div
      className={clsx(
        styles.shell,
        fullWidth && styles.fullWidth,
        invalid && styles.shellInvalid,
        isDisabled && styles.shellDisabled,
        className
      )}
      data-invalid={invalid ? 'true' : undefined}
      data-disabled={isDisabled ? 'true' : undefined}
    >
      {leftIcon ? (
        <span className={clsx(styles.icon, styles.iconLeft)} aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}

      {control}

      {rightIcon ? (
        <span className={clsx(styles.icon, styles.iconRight)} aria-hidden="true">
          {rightIcon}
        </span>
      ) : null}
    </div>
  )
}

FieldShell.displayName = 'FieldShell'

export { FieldShell, type FieldShellProps }
