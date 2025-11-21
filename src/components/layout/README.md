# Layout Components

This directory contains the core layout components for the CyanNobat application.

## Components

### Navigation & Structure

- **Header** - Top navigation bar with logo, theme toggle, notifications, account widget, and CTA
- **Sidebar** - Fixed navigation sidebar (GNOME-style) with glassmorphic styling
- **Logo** - Application logo component

### Glass Layout Wrappers

- **GlassLayoutWrapper** - Main content wrapper with glass styling
- **GlassContentArea** - Content area wrapper with glass effects
- **GlassBackdropBlur** - Decorative background blur effect
- **GlassHeaderDivider** - Decorative gradient divider

### Decorative Elements

- **LiquidBlob** - Animated liquid glass blob for background decoration

## Usage

Import from the layout barrel:

```tsx
import { Header, Sidebar, Logo, GlassLayoutWrapper } from '@/components/layout';

// Layout structure
<div className="flex min-h-screen">
  <Sidebar />
  <div className="flex flex-1 flex-col">
    <Header />
    <main>
      <GlassLayoutWrapper>
        {children}
      </GlassLayoutWrapper>
    </main>
  </div>
</div>
```

## Glass Layout Wrappers

### GlassLayoutWrapper

Main content wrapper with full glass styling:

```tsx
<GlassLayoutWrapper className="p-8">
  <h1>Page Content</h1>
</GlassLayoutWrapper>
```

### GlassContentArea

Section wrapper for content blocks:

```tsx
<GlassContentArea className="p-6">
  <p>Content section</p>
</GlassContentArea>
```

### GlassBackdropBlur

Decorative blur effects:

```tsx
<GlassBackdropBlur
  variant="primary"
  size="lg"
  top="-12rem"
  left="-6rem"
/>
```

Props:
- `variant`: 'primary' | 'accent' | 'muted'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `top`, `left`, `right`, `bottom`: Position values

### GlassHeaderDivider

Subtle gradient line:

```tsx
<GlassHeaderDivider />
```

## LiquidBlob

Animated morphing blob for background decoration:

```tsx
import { LiquidBlob } from '@/components/layout';

<LiquidBlob
  size="lg"
  variant="accent"
  top="10%"
  right="5%"
  speed={1.2}
/>
```

Props:
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `variant`: 'primary' | 'accent' | 'muted'
- `speed`: Animation speed multiplier (default: 1)
- `top`, `left`, `right`, `bottom`: Position values

## Header

Sticky navigation header with glassmorphic styling:

```tsx
<Header />
```

Features:
- Logo on the left
- Theme toggle
- Notification button
- Account widget
- Primary CTA button (رزرو نوبت)
- Sticky positioning with backdrop blur

## Sidebar

Fixed navigation sidebar for main app navigation:

```tsx
<Sidebar />
```

Features:
- Responsive (mobile bottom bar, desktop right sidebar)
- Active route indicators with smooth morphing animation
- Glassmorphic styling
- Icon + label navigation items
- Separated main and action items

## Integration with Theme

All layout components support the application theme system:

```tsx
import { ThemeProvider } from '@/components/theme';

<ThemeProvider>
  <Header />
  <Sidebar />
  {/* Your content */}
</ThemeProvider>
```

## RTL Support

All layout components are RTL-compatible and work seamlessly with Persian content.
