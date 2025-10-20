# CyanNobat Design System

**Version**: 1.0
**Architecture**: Hybrid (Global Classes + React Components)

## Overview

This design system follows a **hybrid approach** that balances simplicity with functionality:

- **Global CSS Classes** (`.glass-*`) for simple, reusable visual patterns
- **React Components** (`@/components/ui`) for complex, interactive elements with props and validation

This matches the approach used by modern design systems like shadcn/ui and Radix UI.

---

## Architecture Decisions

### Why Hybrid?

1. **Performance**: Global classes are lightweight and don't increase bundle size
2. **Developer Experience**: React components provide TypeScript safety and autocomplete
3. **Consistency**: Centralized styling prevents the 60+ inline class anti-patterns
4. **Flexibility**: Easy to extend without modifying the core system

### When to Use What?

| Pattern | Use Global Class | Use React Component |
|---------|------------------|---------------------|
| Simple container/card | ✅ `.glass-panel` | ❌ |
| Button with loading state | ❌ | ✅ `<Button isLoading>` |
| Form input with validation | ❌ | ✅ `<Input error="...">` |
| Status chip/badge | ✅ `.glass-chip` or `<Chip>` | Either works |
| Complex stepper UI | ❌ | ✅ Custom component |

---

## Global Classes (from `globals.css`)

These classes are defined in `styles/globals.css` under `@layer components`.

### Container Classes

#### `.glass`
Main glassmorphic container with blur, shadows, and elastic hover effects.

```tsx
<div className="glass p-6">
  {/* Content */}
</div>
```

**Features**:
- 2rem border radius
- Backdrop blur + saturation
- Elastic spring transitions
- Hover state with enhanced blur
- Fully dark mode compatible

#### `.glass-pill`
Fully rounded pill-shaped glass container. Perfect for buttons, badges, tags.

```tsx
<button className="glass-pill px-5 py-2">
  Click me
</button>
```

#### `.glass-panel` + Variants
The workhorse for cards and sections. Lighter blur than `.glass`, better for content.

```tsx
<div className="glass-panel glass-panel--muted p-6">
  {/* Content */}
</div>
```

**Variants**:
- `.glass-panel--muted` - More transparent (74% opacity)
- `.glass-panel--subtle` - Very transparent (68% opacity)
- `.glass-panel--compact` - Smaller border radius
- `.glass-panel--active` - Accent border with shadow
- `.glass-panel--accent` - Accent background color

#### `.glass-chip` + Variants
Small chips for tags, time slots, selections.

```tsx
<div className="glass-chip glass-chip--interactive px-3 py-2">
  10:00
</div>
```

**Variants**:
- `.glass-chip--interactive` - Hover/focus states
- `.glass-chip--circle` - Circular chip (36px × 36px)
- `.glass-chip--muted` - Lighter color
- `.glass-chip--current` - Current selection
- `.glass-chip--active` - Active/selected state

**Utility**:
- `.glass-chip__meta` - Small metadata text inside chips

### Button Classes

#### `.btn-primary`
Primary action button with gradient background and glow effects.

```tsx
<button className="btn-primary">
  تایید نهایی
</button>
```

**Features**:
- Gradient background (accent → accent-strong)
- Glow shadow on hover
- `translateY(-3px)` lift effect
- Disabled state with reduced opacity
- Elastic spring transition (`cubic-bezier(0.34, 1.56, 0.64, 1)`)

#### `.btn-secondary`
Secondary glass button for less prominent actions.

```tsx
<button className="btn-secondary">
  انصراف
</button>
```

---

## React Components (`@/components/ui`)

Import from `@/components/ui`:

```tsx
import { Button, Input, Card, Chip } from '@/components/ui'
```

### `<Button>`

Unified button component wrapping global button classes.

**Props**:
- `variant`: `'primary' | 'secondary' | 'glass-pill'`
- `size`: `'sm' | 'md' | 'lg'` (for glass-pill variant)
- `isLoading`: Shows spinner
- `leftIcon`, `rightIcon`: Icon elements
- `fullWidth`: Stretch to container width
- `disableAnimation`: Disable Framer Motion

**Examples**:

```tsx
// Primary action
<Button variant="primary">تایید</Button>

// With loading state
<Button variant="primary" isLoading>
  در حال ارسال...
</Button>

// With icon
<Button variant="secondary" leftIcon={<CheckIcon />}>
  تایید شده
</Button>

// Glass pill style
<Button variant="glass-pill" size="sm">
  انتخاب
</Button>
```

**Animation Strategy**:
- `primary` and `secondary` use CSS transitions from globals.css
- `glass-pill` uses Framer Motion for `whileHover` and `whileTap`
- Respects `prefers-reduced-motion`

---

### `<Input>`

Consolidated input component replacing `BookingInput` and inline patterns.

**Props**:
- `label`: Field label
- `error`: Error message (shows below input)
- `helperText`: Helper text (shows below input)
- `leftIcon`, `rightIcon`: Icon elements
- `fullWidth`: Default `true`
- All standard `<input>` props

**Examples**:

```tsx
// Basic input
<Input
  label="نام"
  placeholder="نام خود را وارد کنید"
/>

// With validation
<Input
  type="email"
  label="ایمیل"
  error={emailError}
/>

// With icon
<Input
  leftIcon={<SearchIcon />}
  placeholder="جستجو..."
/>
```

**Styling**:
- Matches `.glass-panel` aesthetic
- Consistent hover/focus states
- Error state with red border
- RTL-aware (text-right)

---

### `<Textarea>`

Textarea component matching `<Input>` styling. Replaces the 60+ class inline pattern from `ContactSection`.

**Props**:
- `label`, `error`, `helperText`: Same as `<Input>`
- `showCharCount`: Shows character counter
- `maxLength`: Maximum characters
- All standard `<textarea>` props

**Example**:

```tsx
<Textarea
  label="توضیحات"
  rows={4}
  maxLength={500}
  showCharCount
  helperText="توضیحات اضافی خود را وارد کنید"
/>
```

---

### `<Select>`

Select dropdown matching `<Input>` styling. Replaces `BookingSelect`.

**Props**:
- `label`, `error`, `helperText`: Same as `<Input>`
- `options`: Array of `{ value, label, disabled? }`
- `placeholder`: Placeholder option
- All standard `<select>` props

**Example**:

```tsx
<Select
  label="انتخاب سرویس"
  options={[
    { value: '1', label: 'سرویس A' },
    { value: '2', label: 'سرویس B' },
    { value: '3', label: 'سرویس C', disabled: true }
  ]}
  placeholder="یک سرویس انتخاب کنید"
/>
```

---

### `<Card>`

Wrapper for `.glass-panel` with React props for easier composition.

**Props**:
- `variant`: `'default' | 'muted' | 'subtle' | 'active' | 'accent' | 'compact'`
- `padding`: `'none' | 'sm' | 'md' | 'lg'`
- `animate`: Apply fade-in-up animation on mount

**Examples**:

```tsx
// Basic card
<Card padding="md">
  <h3>عنوان</h3>
  <p>محتوا</p>
</Card>

// Accent card with animation
<Card variant="accent" animate>
  <p>اعلان مهم</p>
</Card>

// Muted card (more transparent)
<Card variant="muted" padding="lg">
  {/* Background content */}
</Card>
```

**When to use**:
- Use `<Card>` when you need dynamic variants or padding
- Use `.glass-panel` directly for static containers

---

### `<Chip>`

Wrapper for `.glass-chip` with React props.

**Props**:
- `variant`: `'default' | 'muted' | 'current' | 'active' | 'circle'`
- `interactive`: Enable hover/focus states
- `meta`: Small metadata text
- `leftIcon`, `rightIcon`: Icon elements

**Examples**:

```tsx
// Time slot chip
<Chip variant="default" interactive>
  10:00
</Chip>

// Selected chip
<Chip variant="active">
  انتخاب شده
</Chip>

// Circle chip with metadata
<Chip variant="circle" meta="5">
  A
</Chip>
```

---

## Animation Strategy (Hybrid Approach)

Following the user's preference for **Hybrid: Framer for complex, CSS for simple**.

### CSS Animations (globals.css)

Use for simple, performance-critical animations:

```tsx
// Fade in
<div className="animate-fade-in">...</div>

// Fade in with upward motion
<div className="animate-fade-in-up">...</div>

// Fade in with downward motion
<div className="animate-fade-in-down">...</div>

// Slide in from right
<div className="animate-slide-in-right">...</div>
```

**Keyframes available**:
- `fade-in` - Simple opacity fade
- `fade-in-up` - Fade + translateY(20px) + scale(0.95)
- `fade-in-down` - Fade + translateY(-20px)
- `slide-in-right` - Fade + translateX(30px)
- `liquid-morph` - Blob morphing animation

**Accessibility**: All animations respect `prefers-reduced-motion: reduce` and disable automatically.

### Framer Motion

Use for complex, interactive animations:

```tsx
import { motion } from 'framer-motion'

// Gesture-aware button
<motion.button
  whileHover={{ scale: 1.05, y: -3 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>

// Stagger children animation
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

**When to use Framer Motion**:
- Multi-step animations with orchestration
- Gesture-based interactions (drag, swipe)
- Layout animations (`layout` prop)
- Exit animations with `AnimatePresence`

**When NOT to use Framer Motion**:
- Simple fade-ins on mount → Use CSS `animate-fade-in`
- Hover scale/translate → Use CSS if possible
- Static animations without user interaction

---

## Migration Guide

### Before (Inconsistent)

```tsx
// ❌ Multiple approaches for the same pattern
// BookingSummary.tsx
<div className="rounded-2xl border border-white/20 bg-white/35 backdrop-blur-lg p-6">
  {/* Content */}
</div>

// ServiceSection.tsx
const cardClasses = 'rounded-2xl sm:rounded-3xl border border-white/25 bg-white/45 dark:bg-white/10 dark:border-white/15 p-5'
<div className={cardClasses}>
  {/* Content */}
</div>

// ContactSection.tsx (60+ classes!)
<textarea className="mt-2 min-h-[100px] w-full rounded-xl border border-white/20 bg-white/50 px-4 py-3 text-right text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 hover:border-white/30 hover:bg-white/60 focus:border-accent focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/12 dark:bg-white/10..." />
```

### After (Unified)

```tsx
// ✅ Consistent design system
import { Card, Textarea } from '@/components/ui'

// BookingSummary.tsx
<Card padding="md">
  {/* Content */}
</Card>

// ServiceSection.tsx
<Card variant="muted" padding="lg">
  {/* Content */}
</Card>

// ContactSection.tsx
<Textarea
  label="توضیحات"
  rows={4}
  helperText="توضیحات خود را وارد کنید"
/>
```

---

## Color System

All colors use CSS custom properties defined in `globals.css`:

### Light Mode (`:root`)
- `--bg`: 250 252 255 (Background)
- `--fg`: 20 24 28 (Foreground text)
- `--muted`: 231 234 238 (Muted backgrounds)
- `--muted-foreground`: 55 62 75 (Muted text)
- `--card`: 255 255 255 (Card background)
- `--border`: 201 205 209 (Borders)
- `--accent`: 159 221 231 (Primary accent color - Cyan)
- `--accent-strong`: 110 169 183 (Strong accent)
- `--ring`: 110 169 183 (Focus rings)

### Dark Mode (`[data-theme='dark']`)
- `--bg`: 15 18 25
- `--fg`: 230 236 242
- `--muted`: 39 47 63
- `--muted-foreground`: 195 202 215
- `--card`: 25 30 40
- `--border`: 60 70 85
- `--accent`: 159 221 231
- `--accent-strong`: 79 120 131
- `--ring`: 159 221 231

### Usage in Tailwind

```tsx
// Using semantic color tokens
<div className="bg-background text-foreground border-border">
  <p className="text-muted-foreground">Muted text</p>
  <button className="bg-accent hover:bg-accent-strong">
    Action
  </button>
</div>
```

### Usage in Custom CSS

```css
.my-component {
  background: rgb(var(--card) / 0.8);
  color: rgb(var(--foreground));
  border: 1px solid rgb(var(--border) / 0.4);
}

.my-component:hover {
  border-color: rgb(var(--accent) / 0.6);
}
```

---

## Typography

### Font Family
- **Primary**: Peyda (Persian-optimized)
- **Fallback**: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

### Font Weights
- Regular: 400
- Medium: 500
- Bold: 700

### Text Direction
All text components default to RTL (`text-right`) for Persian support.

---

## Accessibility

### Focus Indicators
All interactive elements have visible focus rings defined globally:

```css
:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgba(var(--ring) / 0.8),
    0 0 0 4px rgba(255, 255, 255, 0.35);
}
```

### Motion Preferences
All animations respect `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-fade-in-up,
  .glass,
  /* ... */ {
    animation: none;
    transition: none;
    transform: none;
  }
}
```

### Form Accessibility
All form components include:
- Proper `<label>` associations
- `aria-invalid` for error states
- `aria-describedby` for error/helper text
- Unique auto-generated IDs

---

## Best Practices

### DO ✅

1. **Use the design system components**:
   ```tsx
   import { Button, Input, Card } from '@/components/ui'
   ```

2. **Leverage global classes for simple containers**:
   ```tsx
   <div className="glass-panel glass-panel--muted p-6">
   ```

3. **Use Tailwind for layout and spacing**:
   ```tsx
   <Card className="mt-4 sm:mt-6" padding="md">
   ```

4. **Compose components for complex UIs**:
   ```tsx
   <Card variant="accent" padding="lg">
     <Input label="نام" />
     <Button variant="primary">ارسال</Button>
   </Card>
   ```

### DON'T ❌

1. **Don't duplicate glassmorphic styles inline**:
   ```tsx
   // ❌ Bad
   <div className="rounded-xl border border-white/20 bg-white/50 backdrop-blur-md">

   // ✅ Good
   <div className="glass-panel">
   ```

2. **Don't create 60+ class inline strings**:
   ```tsx
   // ❌ Bad
   <input className="w-full rounded-xl border border-white/20 bg-white/50 px-4 py-2.5 text-right text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 hover:border-white/30 hover:bg-white/60 focus:border-accent focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/12 dark:bg-white/10..." />

   // ✅ Good
   <Input />
   ```

3. **Don't mix animation approaches inconsistently**:
   ```tsx
   // ❌ Bad - inline animation style
   <div style={{ animation: 'fade-in 0.6s ease-out' }}>

   // ✅ Good - CSS animation class
   <div className="animate-fade-in">

   // ✅ Also good - Framer Motion for complex interactions
   <motion.div animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
   ```

4. **Don't hardcode colors** - use CSS variables:
   ```tsx
   // ❌ Bad
   <div className="bg-[#9FDDE7]">

   // ✅ Good
   <div className="bg-accent">
   ```

---

## Component Checklist

When creating new components, ensure:

- [ ] Uses design system components from `@/components/ui`
- [ ] Or uses global `.glass-*` classes if simple container
- [ ] Colors use CSS custom properties (`--bg`, `--accent`, etc.)
- [ ] Animations use CSS classes or Framer Motion (not inline styles)
- [ ] Dark mode works via CSS variables (no JS theme checks)
- [ ] RTL support for text (`text-right` by default)
- [ ] Accessibility: focus states, ARIA attributes, semantic HTML
- [ ] Respects `prefers-reduced-motion`
- [ ] TypeScript types exported

---

## File Structure

```
src/
├── components/
│   └── ui/                    # Design system components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Textarea.tsx
│       ├── Select.tsx
│       ├── Card.tsx
│       ├── Chip.tsx
│       └── index.ts           # Barrel export
├── styles/
│   └── globals.css            # Global classes + CSS variables
└── ...

DESIGN_SYSTEM.md               # This file
CLAUDE.md                      # Project overview
```

---

## Roadmap

Future enhancements:

- [ ] Toast/notification component
- [ ] Modal/dialog component
- [ ] Dropdown menu component
- [ ] Date picker component
- [ ] Loading skeleton component
- [ ] Badge component
- [ ] Avatar component
- [ ] Tabs component
- [ ] Accordion component
- [ ] Table component

---

## Questions?

See `CLAUDE.md` for project overview and architecture details.

For component API documentation, check the TypeScript types:

```tsx
import { ButtonProps } from '@/components/ui'
```

All components are fully typed with JSDoc comments.
