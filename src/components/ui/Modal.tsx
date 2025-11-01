'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import React, { ComponentPropsWithoutRef, CSSProperties, ElementRef, forwardRef } from 'react'

import { cn } from '@/lib/utils'

type ModalTone = 'surface' | 'muted' | 'accent'
type ModalSize = 'sm' | 'md' | 'lg'

const modalToneStyles: Record<ModalTone, CSSProperties> = {
  surface: { background: 'linear-gradient(155deg, color-mix(in srgb, var(--card) 90%, transparent), color-mix(in srgb, var(--card) 70%, transparent))' } as CSSProperties,
  muted: { background: 'linear-gradient(155deg, color-mix(in srgb, var(--muted) 72%, transparent), color-mix(in srgb, var(--card) 65%, transparent))', borderColor: 'rgba(var(--muted-foreground-rgb, 78 94 120), 0.45)' } as CSSProperties,
  accent: { background: 'linear-gradient(160deg, color-mix(in srgb, var(--accent-strong) 72%, rgba(255, 255, 255, 0.08)), color-mix(in srgb, var(--accent) 82%, rgba(255, 255, 255, 0.12)))', color: 'var(--accent-foreground, rgb(var(--fg-rgb)))', borderColor: 'rgba(var(--accent-rgb), 0.55)', boxShadow: '0 40px 80px -32px rgba(var(--accent-rgb), 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)' } as CSSProperties,
}

const sizeClassNames: Record<ModalSize, string> = {
  sm: '[--modal-width:26rem] [--modal-padding:var(--space-glass-sm)]',
  md: '[--modal-width:32rem] [--modal-padding:var(--space-glass-md)]',
  lg: '[--modal-width:40rem] [--modal-padding:calc(var(--space-glass-md)+0.75rem)]',
}

type ModalContentElement = ElementRef<typeof DialogPrimitive.Content>

interface ModalContentProps extends DialogPrimitive.DialogContentProps {
  tone?: ModalTone
  size?: ModalSize
  overlayClassName?: string
}

const ModalRoot = DialogPrimitive.Root
const ModalTrigger = DialogPrimitive.Trigger
const ModalPortal = DialogPrimitive.Portal
const ModalClosePrimitive = DialogPrimitive.Close

const ModalContent = forwardRef<ModalContentElement, ModalContentProps>(
  ({ tone = 'surface', size = 'md', className, overlayClassName, children, ...props }, ref) => (
    <ModalPortal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-[color-mix(in_srgb,rgb(var(--bg-rgb))_30%,rgba(8,20,38,0.78))] backdrop-blur-[18px] backdrop-saturate-[1.25] animate-modal-overlay-in',
          'dark:bg-[color-mix(in_srgb,rgba(0,4,14,0.82)_85%,rgba(12,22,38,0.9))]',
          overlayClassName
        )}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-[51] flex w-[min(92vw,var(--modal-width,32rem))] max-w-full -translate-x-1/2 -translate-y-1/2 flex-col gap-[var(--space-glass-sm)] rounded-3xl border p-[var(--modal-padding,var(--space-glass-md))] text-foreground shadow-glass animate-modal-content-in',
          sizeClassNames[size],
          className
        )}
        style={modalToneStyles[tone]}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </ModalPortal>
  )
)

ModalContent.displayName = 'ModalContent'

const ModalTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  DialogPrimitive.DialogTitleProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-right text-xl font-bold tracking-[-0.01em]', className)}
    {...props}
  />
))

ModalTitle.displayName = 'ModalTitle'

const ModalDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  DialogPrimitive.DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      'text-right text-[0.95rem] text-[rgba(var(--fg-rgb),0.72)] dark:text-[rgba(var(--fg-rgb),0.75)]',
      className
    )}
    {...props}
  />
))

ModalDescription.displayName = 'ModalDescription'

type ModalSectionProps = ComponentPropsWithoutRef<'div'>

const ModalHeader = ({ className, ...props }: ModalSectionProps) => (
  <div className={cn('flex flex-col gap-3', className)} {...props} />
)

const ModalBody = ({ className, ...props }: ModalSectionProps) => (
  <div className={cn('flex flex-col gap-4 text-[rgba(var(--fg-rgb),0.9)]', className)} {...props} />
)

const ModalFooter = ({ className, ...props }: ModalSectionProps) => (
  <div className={cn('mt-2 flex flex-wrap items-center justify-end gap-3', className)} {...props} />
)

interface ModalCloseProps extends DialogPrimitive.DialogCloseProps {
  icon?: boolean
}

const ModalClose = forwardRef<ElementRef<typeof ModalClosePrimitive>, ModalCloseProps>(
  ({ className, children, icon = true, ...props }, ref) => (
    <ModalClosePrimitive
      ref={ref}
      className={cn(
        'absolute top-[1.1rem] end-[1.1rem] inline-flex h-9 w-9 items-center justify-center rounded-pill border border-[rgba(var(--border-rgb),0.45)] bg-[color-mix(in_srgb,var(--card)_80%,transparent)] text-[rgba(var(--fg-rgb),0.82)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-[transform,background,border-color] duration-200 ease-glass',
        'hover:-translate-y-[1px] hover:border-[rgba(var(--accent-rgb),0.45)] hover:bg-[color-mix(in_srgb,var(--card)_92%,transparent)]',
        'focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_25%,transparent),0_0_0_5px_rgb(var(--ring-rgb)/0.35)]',
        className
      )}
      {...props}
    >
      {icon && <X aria-hidden className="h-[1.1rem] w-[1.1rem]" />}
      {!icon && children}
      {icon && children}
    </ModalClosePrimitive>
  )
)

ModalClose.displayName = 'ModalClose'

export {
  ModalRoot as Modal,
  ModalTrigger,
  ModalContent,
  ModalTitle,
  ModalDescription,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalClose,
  type ModalContentProps,
  type ModalTone,
  type ModalSize,
}
