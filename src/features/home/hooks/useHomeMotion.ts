import { useCallback, useMemo } from 'react';
import type { MotionProps } from 'framer-motion';
import { luxuryContainer, luxurySlideFade } from '@/lib/luxuryAnimations';

const limitDuration = (value: number) => {
  return value > 0.35 ? 0.35 : value;
};

type HeroVariants = {
  card: MotionProps['variants'];
  badge: MotionProps['variants'];
  title: MotionProps['variants'];
  description: MotionProps['variants'];
  actions: MotionProps['variants'];
};

type HomeMotion = {
  stepsContainer?: MotionProps['variants'];
  hero: HeroVariants;
  getStepVariants: (index: number) => MotionProps['variants'];
};

export const useHomeMotion = (reduceMotion: boolean): HomeMotion => {
  const configureSlideFade = useCallback(
    (
      direction: Parameters<typeof luxurySlideFade>[0],
      options: Parameters<typeof luxurySlideFade>[1] = {},
    ) => {
      if (!reduceMotion) {
        return luxurySlideFade(direction, options);
      }

      const { duration = 0.35, delayIn, delayOut } = options ?? {};

      return luxurySlideFade(direction, {
        ...options,
        distance: 0,
        scale: 1,
        blur: 0,
        duration: limitDuration(duration),
        delayIn: delayIn ?? 0,
        delayOut: delayOut ?? 0,
      });
    },
    [reduceMotion],
  );

  const hero = useMemo<HeroVariants>(
    () => ({
      card: configureSlideFade('right', {
        distance: 32,
        duration: 0.9,
        scale: 0.96,
        blur: 0,
        delayIn: 0.1,
      }),
      badge: configureSlideFade('up', {
        distance: 16,
        duration: 0.8,
        scale: 0.98,
        blur: 0,
        delayIn: 0.2,
      }),
      title: configureSlideFade('up', {
        distance: 24,
        duration: 0.9,
        scale: 0.96,
        blur: 1,
        delayIn: 0.3,
      }),
      description: configureSlideFade('up', {
        distance: 16,
        duration: 1.0,
        scale: 0.98,
        blur: 0,
        delayIn: 0.4,
      }),
      actions: configureSlideFade('up', {
        distance: 16,
        duration: 1.0,
        scale: 0.98,
        blur: 0,
        delayIn: 0.5,
      }),
    }),
    [configureSlideFade],
  );

  const getStepVariants = useCallback(
    (index: number) =>
      configureSlideFade('right', {
        distance: 32,
        duration: 0.8,
        scale: 0.96,
        blur: 0,
        delayIn: index * 0.08 + 0.15,
      }),
    [configureSlideFade],
  );

  return {
    stepsContainer: reduceMotion ? undefined : luxuryContainer,
    hero,
    getStepVariants,
  };
};
