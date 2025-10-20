'use client'

import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

import useSmoothLoading from '@/hooks/useSmoothLoading'

interface GlobalLoadingOverlayProps {
  /** Whether the loading state is active */
  active: boolean
  /** Message to display while loading */
  message?: string
}

/**
 * GlobalLoadingOverlay
 * Displays a subtle full-screen loading overlay
 * Uses useSmoothLoading to prevent flicker on quick transitions
 */
const GlobalLoadingOverlay = ({
  active,
  message = 'در حال بارگذاری...',
}: GlobalLoadingOverlayProps) => {
  const prefersReducedMotion = useReducedMotion()

  // Smooth loading prevents flicker for quick loads
  const visible = useSmoothLoading(active, {
    showDelayMs: 0, // Show immediately (navigation should be visible)
    minVisibleMs: 300, // Keep visible for minimum time to prevent jitter
  })

  const overlayTransitions = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }

  const panelTransitions = prefersReducedMotion
    ? { initial: { opacity: 1, scale: 1 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 1, scale: 1 }, transition: { duration: 0 } }
    : { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          {...overlayTransitions}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm dark:bg-black/40"
          style={{ pointerEvents: 'none' }}
        >
          <motion.div {...panelTransitions} className="glass flex flex-col items-center gap-4 px-8 py-6">
            {/* Loading Spinner */}
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
              <div
                className={`absolute inset-0 rounded-full border-4 border-transparent border-t-accent${
                  prefersReducedMotion ? '' : ' animate-spin'
                }`}
              />
            </div>

            {/* Loading Message */}
            {message && <p className="text-sm font-medium text-foreground">{message}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GlobalLoadingOverlay
