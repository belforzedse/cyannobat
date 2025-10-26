# Liquid Glass Animation System

This project now includes iOS 26-inspired liquid glass animations with elastic spring physics. All animations respect `prefers-reduced-motion` accessibility settings.

## 🎨 Animation Utilities (`src/lib/animations.ts`)

### Spring Configurations

```typescript
import { liquidSpring, gentleSpring, bouncySpring } from '@/lib/animations';

// iOS 26 elastic spring (recommended for most interactions)
liquidSpring: { stiffness: 300, damping: 25, mass: 0.8 }

// Smooth spring for gentle movements
gentleSpring: { stiffness: 200, damping: 30, mass: 1 }

// Bouncy spring for playful interactions
bouncySpring: { stiffness: 400, damping: 20, mass: 0.6 }
```

### Animation Variants

#### Liquid Entrance
Elements morph in with elastic spring animation:
```tsx
import { liquidEntrance } from '@/lib/animations';

<motion.div variants={liquidEntrance}>
  Content
</motion.div>
```

#### Liquid Container
Staggered children animations:
```tsx
import { liquidContainer, liquidEntrance } from '@/lib/animations';

<motion.div variants={liquidContainer}>
  {items.map(item => (
    <motion.div key={item.id} variants={liquidEntrance}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

#### Glass Morph
Hover and tap effects for glass elements:
```tsx
import { glassMorph } from '@/lib/animations';

<motion.div variants={glassMorph} initial="initial" whileHover="hover" whileTap="tap">
  Hover me
</motion.div>
```

#### Slide In
Directional entrance animations:
```tsx
import { slideIn } from '@/lib/animations';

<motion.div variants={slideIn('left')}>
  Slides in from left
</motion.div>
```

#### Ripple Effect
Interactive ripple on tap:
```tsx
import { rippleEffect } from '@/lib/animations';

<motion.button whileTap={rippleEffect}>
  Click me
</motion.button>
```

## 🧩 Components

### GlassCard
Enhanced card with liquid entrance and hover effects:
```tsx
import GlassCard from '@/components/GlassCard';

<GlassCard title="Title" description="Description">
  Content
</GlassCard>
```

Features:
- Automatic scroll-triggered entrance animation
- Elastic hover effect with scale and lift
- Tap feedback with spring physics
- Liquid glow effects on hover

### GlassIcon
Animated icon container inspired by ReactBits:
```tsx
import GlassIcon from '@/components/GlassIcon';
import { Sparkles } from 'lucide-react';

<GlassIcon
  icon={Sparkles}
  size="md"  // sm, md, lg, xl
  glow={true}
  label="Sparkles icon"
/>
```

Features:
- Glass morphism effect with backdrop blur
- Hover scale and rotation animation
- Optional glow effect
- Four size variants
- Accessible with aria-label

### LiquidBlob
Animated background decoration:
```tsx
import LiquidBlob from '@/components/LiquidBlob';

<LiquidBlob
  top="10%"
  left="20%"
  size="lg"  // sm, md, lg, xl
  variant="primary"  // primary, accent, muted
  speed={1.2}
/>
```

Features:
- Smooth morphing animation
- Configurable position, size, and color
- Adjustable animation speed
- Respects reduced motion preferences

### GlassSurface (ReactBits-inspired)
Advanced glass component with SVG displacement maps for chromatic aberration:
```tsx
import GlassSurface from '@/components/GlassSurface';

<GlassSurface
  width="100%"
  height={120}
  borderRadius={16}
  brightness={50}
  blur={11}
  opacity={0.93}
>
  <div>Your content</div>
</GlassSurface>
```

Features:
- SVG displacement maps for refraction effects
- Chromatic aberration with customizable RGB offsets
- Automatic dark mode support with next-themes
- Fallbacks for browsers without SVG filter support
- Fully responsive with ResizeObserver
- Customizable blur, brightness, saturation, opacity

Advanced customization:
```tsx
<GlassSurface
  displace={2}           // Displacement intensity
  distortionScale={-180} // Refraction strength
  redOffset={0}          // Red channel offset
  greenOffset={10}       // Green channel offset
  blueOffset={20}        // Blue channel offset
  saturation={1.5}       // Color saturation
  mixBlendMode="difference" // Blend mode for gradients
>
  Content
</GlassSurface>
```

### Enhanced Components

#### Sidebar
- Liquid spring entrance animation
- Animated active state indicator with `layoutId`
- Hover effects on navigation items
- Icon scale animations
- Morphing blob indicator that flows between items

#### ThemeToggle
- Rotating icon transitions
- Elastic spring on icon swap
- Hover and tap feedback
- Smooth theme morphing

#### Header
- Slide-down entrance with elastic bounce
- Glass morphism styling

## 🎯 CSS Enhancements

### Updated Glass Class
```css
.glass {
  /* Enhanced blur and saturation */
  backdrop-filter: blur(8px) saturate(1.9);

  /* Elastic spring timing */
  transition: all 500ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Performance optimizations */
  will-change: transform, backdrop-filter;
}

.glass:hover {
  /* Increased blur on hover */
  backdrop-filter: blur(12px) saturate(2.1);

  /* Enhanced glow */
  box-shadow: 0 12px 40px rgb(var(--shadow-primary)),
              inset 0 2px 10px rgba(255, 255, 255, 0.5),
              0 0 0 1px rgba(65, 119, 172, 0.15);
}
```

### Button Animations
Both `.btn-primary` and `.btn-secondary` now use elastic spring timings:
```css
transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
will-change: transform, box-shadow;
```

## 📱 Usage Examples

### Hero Section with Staggered Animation
```tsx
import { liquidContainer, liquidEntrance, liquidSpring } from '@/lib/animations';

<motion.section
  variants={{ ...liquidEntrance, ...glassMorph }}
  initial="hidden"
  animate="visible"
  whileHover="hover"
  transition={liquidSpring}
  className="glass"
>
  <motion.h1
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, ...liquidSpring }}
  >
    Welcome
  </motion.h1>
</motion.section>
```

### Card Grid with Stagger
```tsx
<motion.div
  variants={liquidContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  className="grid grid-cols-3 gap-6"
>
  {cards.map(card => (
    <motion.div key={card.id} variants={liquidEntrance}>
      <GlassCard {...card} />
    </motion.div>
  ))}
</motion.div>
```

### Interactive Button
```tsx
<motion.button
  className="btn-primary"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={liquidSpring}
>
  Click Me
</motion.button>
```

## 🎨 Design Philosophy

Our liquid glass animations follow iOS 26's design principles:

1. **Elastic Springs**: All animations use spring physics for natural, fluid motion
2. **Layered Blur**: Dynamic backdrop blur that intensifies on interaction
3. **Subtle Morphing**: Gentle scale and position changes that feel alive
4. **Accessibility First**: All animations respect `prefers-reduced-motion`
5. **Performance**: GPU-accelerated with `will-change` hints

## 🚀 Next Steps

Consider adding:
- Liquid glass form inputs
- Animated modal transitions
- Scroll-triggered parallax with liquid blobs
- Interactive hover trails
- Morphing navigation transitions

For more liquid glass components and effects, check out:
- [ReactBits.dev](https://reactbits.dev) - High-quality React components
- [Liquid Glass UI](https://liquidglassui.org) - iOS-inspired components
- [Framer Motion Docs](https://www.framer.com/motion/) - Animation library reference
