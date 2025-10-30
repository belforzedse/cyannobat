# CyanNobat Design System

**Version**: 2.0
**Architecture**: Layered Primitives + React Components

## Overview

CyanNobat's UI is composed of two complementary layers:

- **Glass Primitives** (`@/components/ui/glass`) – typed building blocks that encapsulate the glassmorphic look using Tailwind utilities.
- **UI Components** (`@/components/ui`) – higher level controls and layouts that compose primitives with behaviour, validation, and animation.

This split keeps the glass aesthetic consistent while giving product teams fully typed components for day‑to‑day work.

---

## Architecture Decisions

### Why layered primitives?

1. **Consistency** – every glass container uses the same tokens, gradients, and transitions.
2. **Type Safety** – primitives and components expose typed variants (no more stringly‑typed `.glass-panel--accent`).
3. **Customization** – Tailwind utilities remain available via `className` when a screen needs bespoke spacing or layout.
4. **Performance** – variants are compiled CSS classes; no runtime style recalculation is required.

### When to use what?

| Pattern | Use Glass Primitive | Use UI Component |
|---------|--------------------|------------------|
| Hero / layout shell | ✅ `GlassSurface` | ❌ |
| Content card or panel | ✅ `GlassPanel` | ✅ `<Card>` (wraps `GlassPanel` + padding helpers) |
| Status chip / slot | ✅ `GlassChip` | ✅ `<Chip>` for icon/meta ergonomics |
| Action button | ✅ `GlassPill` (for raw links) | ✅ `<Button>` for loading states |
| Form field with validation | ❌ | ✅ `<Input>`, `<Select>`, `<Textarea>` |

---

## Glass Primitives (`@/components/ui/glass`)

All primitives are polymorphic (accept an `as` prop) and export helper style functions when you only need the class string.

### `<GlassSurface>`
High fidelity surface used for hero cards and shells.

```tsx
import { GlassSurface } from '@/components/ui/glass'

<GlassSurface className="relative overflow-hidden p-8">
  {/* content */}
</GlassSurface>
```

**Options**:
- `interactive?: boolean` (default `true`) – enables hover lift/shine.

### `<GlassPanel>`
Content friendly container used for cards, modals, and muted sheets.

```tsx
<GlassPanel variant="muted" className="p-6">
  <h3 className="text-lg font-semibold">عنوان</h3>
  <p className="text-sm text-muted-foreground">توضیحات کارت</p>
</GlassPanel>
```

**Variants**:
- `variant`: `'default' | 'muted' | 'subtle' | 'accent'`
- `state`: `'default' | 'active'`
- `density`: `'default' | 'compact'`

### `<GlassChip>`
Interactive chip/badge primitive for slot pickers and status tags.

```tsx
<GlassChip tone="active" interactive className="px-3 py-2 text-xs">
  ۱۰:۳۰ تا ۱۱:۰۰
</GlassChip>
```

**Variants**:
- `tone`: `'default' | 'muted' | 'current' | 'active'`
- `shape`: `'default' | 'circle'`
- `interactive`: hover + focus animation toggle.

### `<GlassPill>`
Rounded pill container for CTA links or icon badges.

```tsx
<GlassPill as={Link} href="/reserve" className="px-4 py-2 text-sm font-medium">
  رزرو نوبت
</GlassPill>
```

**Variants**:
- `interactive?: boolean` – opt out when the parent handles motion.

> Need the classes only? Import `glassSurfaceStyles`, `glassPanelStyles`, `glassChipStyles`, or `glassPillStyles` to style native form elements.

---

## Button Tokens

`styles/globals.css` still exposes `.btn-primary` and `.btn-secondary` for the legacy gradient buttons. They are consumed by `<Button variant="primary|secondary">` and can be reused in Payload rich text renders when necessary.

---

## UI Components (`@/components/ui`)

Import from `@/components/ui`:

```tsx
import { Button, Card, Chip, Input, Select, Textarea } from '@/components/ui'
```

### `<Button>`
Unified button component that wraps the gradient tokens and `GlassPill` styles.

**Props**
- `variant`: `'primary' | 'secondary' | 'glass-pill'`
- `size`: `'sm' | 'md' | 'lg'` (applies to glass pill)
- `isLoading`: show spinner + disables hover motion
- `leftIcon`, `rightIcon`, `fullWidth`, `disableAnimation`

### `<Card>`
Layout primitive built on `GlassPanel`. Handles padding presets and the `animate` entrance class.

### `<Chip>`
User friendly wrapper around `GlassChip` that adds icon slots and optional `meta` text.

### `<Input>`, `<Select>`, `<Textarea>`
Glass-inspired form controls with consistent focus rings, helper text, and error messaging.

### `<ToastProvider>`
App-wide toast system that exposes an ergonomic hook and accessible surface variants.

```tsx
import { useRouter } from 'next/navigation'
import { ToastProvider, useToast } from '@/components/ui'

const router = useRouter()
const { showToast } = useToast()

showToast({
  title: 'درخواست ارسال شد',
  description: 'در چند لحظه آینده وضعیت را اطلاع می‌دهیم.',
  variant: 'info',
  action: {
    label: 'مشاهده',
    onClick: () => router.push('/staff/requests'),
  },
})
```

**Variants**: `success` (default), `error`, `info`

- Announces success & info toasts with `role="status"` and `aria-live="polite"`, while failures use `role="alert"`.
- Optional action buttons dismiss the toast after running unless `dismissOnAction` is explicitly set to `false`.
- Motion respects `prefers-reduced-motion` and surface styles pull from the shared design tokens module.

---

## Usage Notes

- Prefer primitives inside layouts/feature components; they keep the glass aesthetic cohesive.
- Reach for UI components when you need accessibility, keyboard support, loading states, or helper copy.
- Tailwind utilities still work with primitives. Use `className` to adjust spacing, radius, or layout as required.
- ESLint will warn on custom class names that fall outside the Tailwind design tokens—run `pnpm lint` while iterating and address any `:focus-visible` warnings flagged by the shared lint rules.
- Apply the shared Prettier profile with `pnpm format` so component diffs stay consistent (2-space indent, single quotes).
- When composing motion components (`framer-motion`), pass them through the `as` prop (`<GlassPanel as={motion.div} ...>`).

Happy shipping ✨
