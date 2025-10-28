import GlassCard from '@/components/GlassCard';
import GlassIcon from '@/components/GlassIcon';
import type { BookingStep } from '../data/steps';

type StepCardProps = {
  step: BookingStep;
  index: number;
};

const StepCard = ({ step, index }: StepCardProps) => {
  return (
    <GlassCard title={step.title} description={step.description} className="h-full">
      <div className="mt-4 flex items-center justify-between">
        <GlassIcon icon={step.icon} size="sm" label={step.title} />
        <div className="flex items-center gap-2 text-sm text-accent">
          <span className="font-semibold">۰{index + 1}</span>
          <span>گام</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default StepCard;
