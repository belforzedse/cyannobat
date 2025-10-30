'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import React, { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

import { cn } from '@/lib/utils'

import styles from './Modal/Modal.module.css'

type ModalTone = 'surface' | 'muted' | 'accent'
type ModalSize = 'sm' | 'md' | 'lg'

const toneClassNames: Record<ModalTone, string> = {
  surface: styles.toneSurface,
  muted: styles.toneMuted,
  accent: styles.toneAccent,
}

const sizeClassNames: Record<ModalSize, string> = {
  sm: styles.sizeSM,
  md: styles.sizeMD,
  lg: styles.sizeLG,
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
      <DialogPrimitive.Overlay className={cn(styles.overlay, overlayClassName)} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(styles.content, toneClassNames[tone], sizeClassNames[size], className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </ModalPortal>
  )
)

ModalContent.displayName = 'ModalContent'

const ModalTitle = forwardRef<ElementRef<typeof DialogPrimitive.Title>, DialogPrimitive.DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={cn(styles.title, className)} {...props} />
  )
)

ModalTitle.displayName = 'ModalTitle'

const ModalDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  DialogPrimitive.DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn(styles.description, className)} {...props} />
))

ModalDescription.displayName = 'ModalDescription'

type ModalSectionProps = ComponentPropsWithoutRef<'div'>

const ModalHeader = ({ className, ...props }: ModalSectionProps) => (
  <div className={cn(styles.header, className)} {...props} />
)

const ModalBody = ({ className, ...props }: ModalSectionProps) => (
  <div className={cn(styles.body, className)} {...props} />
)

const ModalFooter = ({ className, ...props }: ModalSectionProps) => (
  <div className={cn(styles.footer, className)} {...props} />
)

interface ModalCloseProps extends DialogPrimitive.DialogCloseProps {
  icon?: boolean
}

const ModalClose = forwardRef<ElementRef<typeof ModalClosePrimitive>, ModalCloseProps>(
  ({ className, children, icon = true, ...props }, ref) => (
    <ModalClosePrimitive ref={ref} className={cn(styles.close, className)} {...props}>
      {icon && <X aria-hidden className={styles.closeIcon} />}
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
