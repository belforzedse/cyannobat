import { cn } from '@/lib/utils'
import styles from './glass.module.css'

type GlassPanelVariant = 'default' | 'muted' | 'subtle' | 'active' | 'accent' | 'compact'
type GlassChipVariant = 'default' | 'muted' | 'current' | 'active'
type GlassChipShape = 'default' | 'circle'

const glassClasses = {
  surface: styles.glass,
  fallback: styles['glass-fallback'],
  panel: styles['glass-panel'],
  panelMuted: styles['glass-panel--muted'],
  panelSubtle: styles['glass-panel--subtle'],
  panelActive: styles['glass-panel--active'],
  panelAccent: styles['glass-panel--accent'],
  panelCompact: styles['glass-panel--compact'],
  pill: styles['glass-pill'],
  chip: styles['glass-chip'],
  chipMuted: styles['glass-chip--muted'],
  chipCurrent: styles['glass-chip--current'],
  chipActive: styles['glass-chip--active'],
  chipCircle: styles['glass-chip--circle'],
  chipInteractive: styles['glass-chip--interactive'],
  chipMeta: styles['glass-chip__meta'],
}

const panelVariants: Record<GlassPanelVariant, string | undefined> = {
  default: undefined,
  muted: glassClasses.panelMuted,
  subtle: glassClasses.panelSubtle,
  active: glassClasses.panelActive,
  accent: glassClasses.panelAccent,
  compact: glassClasses.panelCompact,
}

const chipVariants: Record<GlassChipVariant, string | undefined> = {
  default: undefined,
  muted: glassClasses.chipMuted,
  current: glassClasses.chipCurrent,
  active: glassClasses.chipActive,
}

const chipShapes: Record<GlassChipShape, string | undefined> = {
  default: undefined,
  circle: glassClasses.chipCircle,
}

type GlassSurfaceOptions = {
  fallback?: boolean
}

type GlassChipOptions = {
  variant?: GlassChipVariant
  interactive?: boolean
  shape?: GlassChipShape
}

export function glassSurfaceClassName(className?: string, options: GlassSurfaceOptions = {}) {
  return cn(glassClasses.surface, options.fallback && glassClasses.fallback, className)
}

export function glassPanelClassName(variant: GlassPanelVariant = 'default', className?: string) {
  return cn(glassClasses.panel, panelVariants[variant], className)
}

export function glassPillClassName(className?: string) {
  return cn(glassClasses.pill, className)
}

export function glassChipClassName(className?: string, options: GlassChipOptions = {}) {
  const { variant = 'default', interactive = false, shape = 'default' } = options

  return cn(
    glassClasses.chip,
    chipVariants[variant],
    chipShapes[shape],
    interactive && glassClasses.chipInteractive,
    className
  )
}

export function glassChipMetaClassName(className?: string) {
  return cn(glassClasses.chipMeta, className)
}

export type { GlassPanelVariant, GlassChipVariant, GlassChipShape }
export { glassClasses }
