/**
 * Liquid Glass Animation Utilities
 * iOS 26-inspired animation variants and spring configurations for Framer Motion
 */

import type { Transition, Variants } from 'framer-motion';

// iOS 26 elastic spring configuration
export const liquidSpring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

// Smooth spring for gentle movements
export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 30,
  mass: 1,
};

// Bouncy spring for playful interactions
export const bouncySpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 20,
  mass: 0.6,
};

/**
 * Liquid Glass entrance animation
 * Elements morph in with elastic spring
 */
export const liquidEntrance: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: liquidSpring,
  },
};

/**
 * Staggered container for liquid entrance
 */
export const liquidContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * Glass morphing hover effect
 */
export const glassMorph: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: liquidSpring,
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
};

/**
 * Floating animation for glass elements
 */
export const floatingGlass: Variants = {
  initial: {
    y: 0,
  },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Ripple effect trigger (for use with whileTap)
 */
export const rippleEffect = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 0.4,
    times: [0, 0.5, 1],
    ease: 'easeOut',
  },
};

/**
 * Slide in from direction
 */
export const slideIn = (direction: 'left' | 'right' | 'up' | 'down' = 'up'): Variants => {
  const offset = 40;
  const variants: Record<string, { x: number; y: number }> = {
    left: { x: -offset, y: 0 },
    right: { x: offset, y: 0 },
    up: { x: 0, y: offset },
    down: { x: 0, y: -offset },
  };

  return {
    hidden: {
      ...variants[direction],
      opacity: 0,
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: liquidSpring,
    },
  };
};

/**
 * Shimmer effect configuration
 */
export const shimmerAnimation = {
  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'linear',
  },
};

/**
 * Theme transition config
 */
export const themeTransition: Transition = {
  duration: 0.5,
  ease: [0.34, 1.56, 0.64, 1], // Elastic easing
};

/**
 * Page transition variants
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 1.04,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Focus ring animation
 */
export const focusRing: Variants = {
  initial: {
    scale: 0.9,
    opacity: 0,
  },
  focused: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
};
