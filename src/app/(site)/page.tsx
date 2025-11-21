'use client';

import { HeroSection, ProcessSteps, SectionGrid } from '@/components/site';

const HeroPage = () => {
  return (
    <div className="flex flex-col pb-8">
      <SectionGrid variant="hero-steps">
        <ProcessSteps className="order-2 space-y-4 text-right lg:order-2 lg:space-y-6" />
        <HeroSection className="order-1 relative isolate overflow-hidden min-h-[460px] px-8 pb-16 pt-16 text-right sm:px-12 lg:order-1 lg:px-20" />
      </SectionGrid>
    </div>
  );
};

export default HeroPage;
