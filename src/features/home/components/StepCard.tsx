import GlassIcon from '@/components/GlassIcon';
import FrostedCard from './FrostedCard/FrostedCard';
import styles from './StepCard.module.css';
import type { BookingStep } from '../data/steps';

type StepCardProps = {
  step: BookingStep;
  index: number;
};

const StepCard = ({ step, index }: StepCardProps) => {
  const stepNumber = new Intl.NumberFormat('fa-IR', {
    minimumIntegerDigits: 2,
  }).format(index + 1);

  return (
    <FrostedCard
      tone="muted"
      padded={false}
      className={styles.stepCard}
      hover={false}
      aria-label={`${step.title} - ${step.description}`}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{step.title}</h3>
        <p className={styles.description}>{step.description}</p>
      </div>
      <div className={styles.footer}>
        <GlassIcon icon={step.icon} size="sm" label={step.title} />
        <div className="flex items-center gap-2">
          <span className={styles.stepNumber}>{stepNumber}</span>
          <span>گام</span>
        </div>
      </div>
    </FrostedCard>
  );
};

export default StepCard;
