import { useEffect, useRef, useState } from 'react';

/**
 * Smooths boolean loading signals to prevent UI flicker
 *
 * Problem: Loading states that toggle rapidly create jarring flicker
 * Solution: Adds configurable delays and minimum visible times
 *
 * @example
 * ```tsx
 * const isLoading = useAtomValue(loadingAtom);
 * const visible = useSmoothLoading(isLoading, {
 *   showDelayMs: 120,    // Wait 120ms before showing loader
 *   minVisibleMs: 300,   // Keep visible for at least 300ms
 * });
 *
 * {visible && <Loader />}
 * ```
 */

interface UseSmoothLoadingOptions {
  /** Delay in ms before showing the loading state (prevents flicker for quick loads) */
  showDelayMs?: number;
  /** Minimum time in ms to keep loading state visible once shown (prevents jitter) */
  minVisibleMs?: number;
}

export default function useSmoothLoading(
  loading: boolean,
  { showDelayMs = 120, minVisibleMs = 300 }: UseSmoothLoadingOptions = {},
): boolean {
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any pending timers
    const clearTimers = () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    if (loading) {
      // Loading started
      clearTimers();

      // Schedule showing the loader after delay
      showTimerRef.current = setTimeout(() => {
        setVisible(true);
        shownAtRef.current = Date.now();
        showTimerRef.current = null;
      }, showDelayMs);
    } else {
      // Loading ended
      clearTimers();

      if (!visible) {
        // Never became visible, so nothing to do
        return;
      }

      // Calculate how long it's been visible
      const now = Date.now();
      const visibleDuration = shownAtRef.current ? now - shownAtRef.current : minVisibleMs;

      if (visibleDuration >= minVisibleMs) {
        // Been visible long enough, hide immediately
        setVisible(false);
        shownAtRef.current = null;
      } else {
        // Not visible long enough, delay hiding
        const remainingTime = minVisibleMs - visibleDuration;
        hideTimerRef.current = setTimeout(() => {
          setVisible(false);
          shownAtRef.current = null;
          hideTimerRef.current = null;
        }, remainingTime);
      }
    }

    // Cleanup timers on unmount
    return clearTimers;
  }, [loading, showDelayMs, minVisibleMs, visible]);

  return visible;
}
