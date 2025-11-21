# Site Components

This directory contains feature-specific components for the main booking site interface.

## Directory Structure

```
site/
├── hero/          # Hero section component
├── steps/         # Process steps component
├── common/        # Shared site components (grids, layouts)
└── index.ts       # Barrel exports
```

## Components

### HeroSection

Main hero section with animated glass effects:

```tsx
import { HeroSection } from '@/components/site';

<HeroSection className="order-1 relative isolate overflow-hidden min-h-[460px] px-8 pb-16 pt-16 text-right sm:px-12 lg:order-1 lg:px-20" />
```

Features:
- Animated entrance with luxury animations
- Responsive image display
- Theme-aware gradient effects
- CTA buttons (primary: booking, secondary: view steps)
- Light bending border effects
- Dark mode glow effects

### ProcessSteps

Booking process explanation with step cards:

```tsx
import { ProcessSteps } from '@/components/site';

<ProcessSteps className="order-2 space-y-4 text-right lg:order-2 lg:space-y-6" />

// Custom steps
<ProcessSteps
  steps={[
    { title: 'Step 1', description: 'Description', icon: MyIcon },
    // ...
  ]}
/>
```

Features:
- Default Persian booking flow steps
- Customizable steps via props
- Animated glass cards
- Staggered entrance animations
- Icon with glow effects

### SectionGrid

Responsive grid layout for site sections:

```tsx
import { SectionGrid } from '@/components/site';

<SectionGrid variant="hero-steps">
  <HeroSection />
  <ProcessSteps />
</SectionGrid>
```

Variants:
- `default` - Standard 2-column grid
- `hero-steps` - Hero + steps layout with custom column sizing

## Usage Example

Complete page layout:

```tsx
import { HeroSection, ProcessSteps, SectionGrid } from '@/components/site';

export default function HomePage() {
  return (
    <div className="flex flex-col pb-8">
      <SectionGrid variant="hero-steps">
        <HeroSection className="order-1 relative isolate overflow-hidden min-h-[460px] px-8 pb-16 pt-16 text-right sm:px-12 lg:px-20" />
        <ProcessSteps className="order-2 space-y-4 text-right lg:space-y-6" />
      </SectionGrid>
    </div>
  );
}
```

## Animation System

All site components integrate with the luxury animation system:

```tsx
import { luxuryPresets, luxurySlideFade } from '@/lib/animation';
```

Animations respect user preferences via `useReducedMotion()`:
- Normal: Full animations with blur, scale, and movement
- Reduced: Simplified animations with minimal motion

## Glass Components

Site components use glass primitives from `@/components/ui/glass`:
- `GlassSurface` - For hero section wrapper
- `GlassCard` - For step cards

## Customization

### Custom Steps

```tsx
import { ProcessSteps, type Step } from '@/components/site';
import { MyIcon } from 'lucide-react';

const mySteps: Step[] = [
  {
    title: 'Custom Step',
    description: 'Step description',
    icon: MyIcon,
  },
];

<ProcessSteps steps={mySteps} />
```

### Custom Styling

All components accept `className` props for additional styling:

```tsx
<HeroSection className="custom-class" />
<ProcessSteps className="custom-class" />
<SectionGrid className="custom-class" variant="default" />
```

## Design Notes

- All components follow the glassmorphic design system
- RTL text alignment for Persian content
- Responsive breakpoints: sm (640px), lg (1024px)
- Performance-optimized animations using GPU acceleration
- Accessible with proper ARIA labels and semantic HTML
