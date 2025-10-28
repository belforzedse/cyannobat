'use client';

import { useReducedMotion } from 'framer-motion';
import HeroSection from './components/HeroSection';
import StepsSection from './components/StepsSection';
import { bookingSteps } from './data/steps';
import { useHomeMotion } from './hooks/useHomeMotion';
import { BOOKING_PATH } from '@/lib/routes';

const HomePage = () => {
  const prefersReducedMotion = useReducedMotion();
  const motion = useHomeMotion(Boolean(prefersReducedMotion));

  return (
    <div className="flex flex-col gap-16 pb-12">
      <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[1fr_minmax(260px,360px)] lg:items-stretch">
        <StepsSection
          steps={bookingSteps}
          containerVariants={motion.stepsContainer}
          getStepVariants={motion.getStepVariants}
        />
        <HeroSection
          bookingHref={BOOKING_PATH}
          stepsHref="#steps"
          variants={motion.hero}
        />
      </div>
    </div>
  );
};

export default HomePage;
