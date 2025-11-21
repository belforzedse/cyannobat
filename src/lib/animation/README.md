# Animation Utilities

This directory contains animation presets and utilities for the CyanNobat application.

## Files

- **luxury.ts** - Luxury animation presets using Framer Motion
- **animations.ts** - General animation utilities and helpers
- **index.ts** - Barrel export for all animation utilities

## Luxury Animation Presets

The luxury animation system provides performance-optimized, high-end animations:

### Available Presets

```tsx
import { luxuryPresets, luxurySlideFade, luxuryContainer } from '@/lib/animation';

// Whisper animation - Subtle entrance
luxuryPresets.whisper('up' | 'down' | 'left' | 'right');

// Container animation - Stagger children
luxuryContainer;

// Custom slide fade
luxurySlideFade('up', {
  distance: 24,
  duration: 0.9,
  scale: 0.96,
  blur: 1,
  delayIn: 0.3,
});
```

### Configuration Options

All luxury animations accept these options:
- `distance` - Movement distance in pixels
- `duration` - Animation duration in seconds
- `scale` - Scale factor (0-1)
- `blur` - Blur amount in pixels (use sparingly for performance)
- `delayIn` - Delay before entrance animation
- `delayOut` - Delay before exit animation

## Usage Examples

### Basic Component Animation

```tsx
import { motion, useReducedMotion } from 'framer-motion';
import { luxuryPresets } from '@/lib/animation';

const MyComponent = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : luxuryPresets.whisper('up')}
      initial="initial"
      animate="animate"
    >
      Content
    </motion.div>
  );
};
```

### Container with Staggered Children

```tsx
import { motion } from 'framer-motion';
import { luxuryContainer, luxurySlideFade } from '@/lib/animation';

const List = () => (
  <motion.div
    variants={luxuryContainer}
    initial="initial"
    animate="animate"
  >
    {items.map((item, index) => (
      <motion.div
        key={item.id}
        variants={luxurySlideFade('right', {
          distance: 32,
          duration: 0.8,
          delayIn: index * 0.08,
        })}
      >
        {item.content}
      </motion.div>
    ))}
  </motion.div>
);
```

### Respecting Reduced Motion Preferences

```tsx
import { useReducedMotion } from 'framer-motion';
import { luxurySlideFade } from '@/lib/animation';

const configureSlideFade = (direction, options = {}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return luxurySlideFade(direction, {
      ...options,
      distance: 0,
      scale: 1,
      blur: 0,
      duration: 0.35,
    });
  }

  return luxurySlideFade(direction, options);
};
```

## Performance Guidelines

1. **Minimize blur usage** - Blur is expensive; use only for initial load, not continuous animations
2. **Use GPU-accelerated properties** - Prefer `transform` and `opacity` over layout properties
3. **Respect reduced motion** - Always check `useReducedMotion()` and provide alternatives
4. **Limit simultaneous animations** - Stagger complex animations to maintain 60fps
5. **Use `will-change` sparingly** - Let Framer Motion handle optimization

## Animation Timing

The luxury animation system uses these easing curves:
- **Entrance**: `cubic-bezier(0.16, 1, 0.3, 1)` - Smooth ease-out
- **Exit**: `cubic-bezier(0.7, 0, 0.84, 0)` - Quick ease-in
- **Spring**: Natural spring physics with reduced bounce

## Integration with Glass Components

Glass components automatically support luxury animations:

```tsx
import { GlassCard } from '@/components/ui/glass';
import { luxuryPresets } from '@/lib/animation';
import { motion } from 'framer-motion';

<GlassCard
  as={motion.div}
  variants={luxuryPresets.whisper('up')}
  initial="initial"
  animate="animate"
>
  Card content
</GlassCard>
```
