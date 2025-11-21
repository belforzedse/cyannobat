# UI Primitives

This directory contains the core UI primitive components for the CyanNobat design system.

## Available Components

### Form Controls

- **Button** - Interactive button component with multiple variants (primary, secondary, outline, ghost, glass-pill)
- **Input** - Text input field with validation and error states
- **Textarea** - Multi-line text input field
- **Select** - Dropdown select component
- **Checkbox** - Boolean checkbox input with custom styling
- **Switch** - Toggle switch component for on/off states

## Usage

Import primitives from the main UI barrel:

```tsx
import { Button, Input, Checkbox } from '@/components/ui';

// Or from the primitives barrel directly:
import { Button, Input } from '@/components/ui/primitives';
```

## Styling

All primitives follow the glassmorphic design system with:
- RTL support (Persian text alignment)
- Light/dark theme compatibility
- Accessible focus states
- Consistent spacing and sizing

## Type Safety

Each component exports its props interface and variant types:

```tsx
import type { ButtonVariant, ButtonProps } from '@/components/ui/primitives';
```
