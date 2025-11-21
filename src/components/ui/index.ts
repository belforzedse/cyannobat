/**
 * CyanNobat UI Component Library
 *
 * Unified design system components following the hybrid approach:
 * - Glass primitives live in ./glass and are built with Tailwind utilities
 * - Form and layout components are React components with props and validation
 *
 * Usage:
 * ```tsx
 * import { Button, Input, Card } from '@/components/ui'
 * ```
 */

// Form components (primitives)
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './primitives/Button';
export { FieldShell, type FieldShellProps } from './FieldShell';
export { Input, type InputProps } from './primitives/Input';
export { Textarea, type TextareaProps } from './primitives/Textarea';
export { Select, type SelectProps, type SelectOption } from './primitives/Select';
export { Checkbox, type CheckboxProps, type CheckboxTone, type CheckboxSize } from './primitives/Checkbox';
export { Switch, type SwitchProps, type SwitchSize, type SwitchTone } from './primitives/Switch';

// Layout components
export { Card, type CardProps, type CardVariant } from './Card';
export { Chip, type ChipProps, type ChipVariant } from './Chip';

// Overlay components
export {
  Modal,
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
} from './Modal';
export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
  type TooltipContentProps,
  type TooltipTone,
  type TooltipSize,
} from './Tooltip';
export {
  ToastProvider,
  useToast,
  type ToastOptions,
  type ToastVariant,
  type ToastAction,
} from './ToastProvider';

// Glass primitives
export * from './glass';
