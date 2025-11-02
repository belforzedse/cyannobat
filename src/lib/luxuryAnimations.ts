/**
 * Luxury Animation Presets
 * Premium animation system inspired by high-end UI/UX design
 * Provides sophisticated easing curves and spring physics for "alive" feeling
 */

import type { Transition, Variants } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

export interface LuxurySlideFadeOptions {
  /** Distance to slide in pixels */
  distance?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Scale effect (0.9 = shrink 10% on entrance) */
  scale?: number;
  /** Blur effect in pixels during transition */
  blur?: number;
  /** Custom easing curve [x1, y1, x2, y2] */
  ease?: number[] | readonly number[];
  /** Delay before entrance animation starts */
  delayIn?: number;
  /** Delay before exit animation starts */
  delayOut?: number;
  /** Use spring physics instead of easing */
  useSpring?: boolean;
  /** Spring damping (10-40, higher = slower) */
  springDamping?: number;
  /** Spring stiffness (100-400, higher = snappier) */
  springStiffness?: number;
  /** Spring mass (0.5-2, higher = heavier) */
  springMass?: number;
}

type Direction = 'left' | 'right' | 'up' | 'down';

// ============================================================================
// LUXURY EASING CURVES
// ============================================================================

export const luxuryEasing = {
  /** Ultra smooth - [0.16, 1, 0.3, 1] */
  butter: [0.16, 1, 0.3, 1] as const,

  /** Elegant and refined - [0.25, 0.46, 0.45, 0.94] */
  champagne: [0.25, 0.46, 0.45, 0.94] as const,

  /** Luxurious and slow - [0.23, 1, 0.32, 1] */
  gold: [0.23, 1, 0.32, 1] as const,

  /** Quick but refined - [0.4, 0, 0.2, 1] */
  crystal: [0.4, 0, 0.2, 1] as const,

  /** Dramatic entrance - [0.12, 0, 0.39, 0] */
  diamond: [0.12, 0, 0.39, 0] as const,
};

// ============================================================================
// LUXURY TRANSITION PRESETS
// ============================================================================

export const luxuryTransitions = {
  /** Ultra smooth transition */
  butter: {
    duration: 0.8,
    ease: luxuryEasing.butter,
  },

  /** Elegant and refined */
  champagne: {
    duration: 1.0,
    ease: luxuryEasing.champagne,
  },

  /** Premium spring feel */
  marble: {
    type: 'spring' as const,
    damping: 25,
    stiffness: 200,
    mass: 0.8,
  },

  /** Luxurious and slow */
  gold: {
    duration: 1.4,
    ease: luxuryEasing.gold,
  },

  /** Quick but refined */
  crystal: {
    duration: 0.6,
    ease: luxuryEasing.crystal,
  },
} satisfies Record<string, Transition>;

// ============================================================================
// LUXURY STAGGER UTILITIES
// ============================================================================

export const luxuryStagger = {
  /** Simple staggered children */
  children: (delay = 0.08) => ({
    staggerChildren: delay,
    delayChildren: 0.1,
  }),

  /** Wave cascade effect */
  cascade: (delay = 0.12) => ({
    staggerChildren: delay,
    delayChildren: 0.15,
    staggerDirection: 1,
  }),

  /** Reverse wave direction */
  wave: (delay = 0.1) => ({
    staggerChildren: delay,
    delayChildren: 0.2,
    staggerDirection: -1,
  }),
};

// ============================================================================
// LUXURY SLIDE FADE ANIMATION
// ============================================================================

/**
 * Creates a luxury slide-fade animation with optional blur and scale effects
 * @param direction - Direction to slide from (left/right/up/down)
 * @param options - Animation configuration options
 * @returns Framer Motion variants object
 */
export function luxurySlideFade(
  direction: Direction = 'up',
  options: LuxurySlideFadeOptions = {},
): Variants {
  const {
    distance = 32,
    duration = 0.9,
    scale = 0.95,
    blur = 0,
    ease = luxuryEasing.butter,
    delayIn = 0,
    delayOut = 0,
    useSpring = false,
    springDamping = 25,
    springStiffness = 200,
    springMass = 0.8,
  } = options;

  // Calculate offset based on direction
  const offset = {
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
  }[direction];

  // Build transition config
  const transition: Transition = useSpring
    ? {
        type: 'spring',
        damping: springDamping,
        stiffness: springStiffness,
        mass: springMass,
      }
    : {
        duration,
        ease,
      };

  return {
    initial: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
      scale,
      filter: blur > 0 ? `blur(${blur}px)` : undefined,
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        ...transition,
        delay: delayIn,
      },
    },
    exit: {
      opacity: 0,
      x: -offset.x,
      y: -offset.y,
      scale,
      filter: blur > 0 ? `blur(${blur}px)` : undefined,
      transition: {
        ...transition,
        delay: delayOut,
      },
    },
  };
}

// ============================================================================
// LUXURY PRESET ANIMATIONS
// ============================================================================

export const luxuryPresets = {
  /**
   * Whisper - Subtle and elegant
   * Perfect for: Secondary content, subtle reveals
   */
  whisper: (direction: Direction = 'up'): Variants =>
    luxurySlideFade(direction, {
      distance: 16,
      duration: 1.0,
      scale: 0.98,
      ease: luxuryEasing.champagne,
    }),

  /**
   * Silk - Premium and smooth
   * Perfect for: Hero sections, primary content
   */
  silk: (direction: Direction = 'up'): Variants =>
    luxurySlideFade(direction, {
      distance: 32,
      duration: 0.9,
      scale: 0.94,
      blur: 2,
      ease: luxuryEasing.butter,
    }),

  /**
   * Velvet - High-end and dramatic
   * Perfect for: Feature showcases, important announcements
   */
  velvet: (direction: Direction = 'up'): Variants =>
    luxurySlideFade(direction, {
      distance: 48,
      duration: 1.2,
      scale: 0.9,
      blur: 4,
      ease: luxuryEasing.gold,
    }),

  /**
   * Cashmere - Spring-based luxury
   * Perfect for: Interactive elements, playful sections
   */
  cashmere: (direction: Direction = 'up'): Variants =>
    luxurySlideFade(direction, {
      useSpring: true,
      springDamping: 20,
      springStiffness: 150,
      springMass: 0.8,
      scale: 0.96,
    }),
};

// ============================================================================
// UTILITY VARIANTS
// ============================================================================

/**
 * Fade in/out without movement
 */
export const luxuryFade: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: luxuryTransitions.butter,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.4 },
  },
};

/**
 * Scale in/out with fade
 */
export const luxuryScale: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: luxuryTransitions.marble,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3 },
  },
};

/**
 * Blur reveal effect
 */
export const luxuryBlur: Variants = {
  initial: { opacity: 0, filter: 'blur(8px)' },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: luxuryTransitions.champagne,
  },
  exit: {
    opacity: 0,
    filter: 'blur(8px)',
    transition: { duration: 0.4 },
  },
};

/**
 * Container for staggered children
 */
export const luxuryContainer: Variants = {
  initial: {},
  animate: {
    transition: luxuryStagger.children(),
  },
  exit: {
    transition: luxuryStagger.children(0.05),
  },
};
