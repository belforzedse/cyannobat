import { motion, type MotionProps } from 'framer-motion';
import StepCard from './StepCard';
import type { BookingStep } from '../data/steps';

type StepsSectionProps = {
  steps: BookingStep[];
  containerVariants?: MotionProps['variants'];
  getStepVariants: (index: number) => MotionProps['variants'];
};

const StepsSection = ({ steps, containerVariants, getStepVariants }: StepsSectionProps) => {
  return (
    <motion.section
      id="steps"
      className="order-2 space-y-6 text-right lg:order-2 lg:space-y-8"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {steps.map((step, index) => (
        <motion.div
          key={step.title}
          variants={getStepVariants(index)}
          initial="initial"
          animate="animate"
        >
          <StepCard step={step} index={index} />
        </motion.div>
      ))}
    </motion.section>
  );
};

export default StepsSection;
