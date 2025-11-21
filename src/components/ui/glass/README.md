# Glass UI Primitives

This directory contains the glassmorphic design system primitives for the CyanNobat application.

## Available Primitives

### Core Components

- **GlassSurface** - Base glass primitive with customizable backdrop blur, gradient, and shadow
- **GlassPanel** - Content-friendly panel with `variant`, `state`, and `density` props for different contexts
- **GlassChip** - Chip/badge primitive with tone and shape variants
- **GlassPill** - Pill-shaped CTA shell (also exposed via `<Button variant="glass-pill">`)
- **GlassCard** - Full-featured card component with variants (`primary`, `secondary`, `muted`), hover effects, and glow animations

### Style Helpers

Each component exports corresponding style helper functions for use with native inputs:
- `glassSurfaceStyles()`
- `glassPanelStyles()`
- `glassChipStyles()`
- `glassPillStyles()`

## Usage

Import from the glass barrel:

```tsx
import { GlassSurface, GlassPanel, GlassCard, GlassChip, GlassPill } from '@/components/ui/glass';

// Example: GlassCard with variant
<GlassCard variant="secondary" title="Welcome" description="Get started">
  <p>Card content here</p>
</GlassCard>

// Example: GlassPanel with state
<GlassPanel variant="default" state="active" density="comfortable">
  Panel content
</GlassPanel>
```

## Variants

### GlassCard Variants
- `primary` - Default glass effect with white/transparent gradient
- `secondary` - Accent-colored glass with tinted gradient
- `muted` - Subtle glass with minimal contrast

### GlassPanel Variants
- `default` - Standard panel styling
- `elevated` - Enhanced shadow and depth
- `inset` - Sunken appearance

### GlassChip Tones
- `neutral` - Gray tones
- `info` - Blue tones
- `success` - Green tones
- `warning` - Yellow/orange tones
- `error` - Red tones

## Design Principles

All glass primitives follow these principles:
- **Backdrop blur** for depth and layering
- **Gradient backgrounds** for subtle visual interest
- **Border treatments** with semi-transparent whites
- **Shadow system** for elevation hierarchy
- **Dark mode support** with adjusted opacity and colors
- **RTL compatibility** for Persian text
- **Performance optimization** using CSS transforms and GPU acceleration

## Animation Support

Glass components integrate with the luxury animation system (`@/lib/animation`):

```tsx
import { motion } from 'framer-motion';
import { luxuryPresets } from '@/lib/animation';
import { GlassCard } from '@/components/ui/glass';

<GlassCard
  as={motion.div}
  variants={luxuryPresets.whisper('up')}
  initial="initial"
  animate="animate"
>
  Animated card content
</GlassCard>
```

## Accessibility

- All decorative glass effects use `aria-hidden`
- Focus states are visible and comply with WCAG standards
- Reduced motion preferences are respected via `useReducedMotion()`
