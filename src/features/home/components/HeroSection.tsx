import Link from 'next/link';
import { motion, type MotionProps } from 'framer-motion';
import clsx from 'clsx';
import { Button } from '@/components/ui';
import FrostedCard from './FrostedCard/FrostedCard';
import styles from './HeroSection.module.css';

type HeroMotionConfig = {
  card?: MotionProps['variants'];
  badge?: MotionProps['variants'];
  title?: MotionProps['variants'];
  description?: MotionProps['variants'];
  actions?: MotionProps['variants'];
};

type HeroSectionProps = {
  bookingHref: string;
  stepsHref: string;
  variants: HeroMotionConfig;
};

const HeroSection = ({ bookingHref, stepsHref, variants }: HeroSectionProps) => {
  return (
    <FrostedCard
      as={motion.section}
      padded={false}
      hover={false}
      variants={variants.card}
      initial="initial"
      animate="animate"
      className={clsx(styles.heroCard, 'order-1 lg:order-1')}
    >
      <div className={styles.haloTop} aria-hidden />
      <div className={styles.haloRight} aria-hidden />
      <div className="flex flex-1 flex-col items-end gap-8">
        <motion.span
          variants={variants.badge}
          initial="initial"
          animate="animate"
          className={styles.badge}
        >
          سایان نوبت — cyannobat
        </motion.span>
        <motion.h1
          variants={variants.title}
          initial="initial"
          animate="animate"
          className={styles.title}
        >
          سایان نوبت
        </motion.h1>
        <motion.p
          variants={variants.description}
          initial="initial"
          animate="animate"
          className={styles.description}
        >
          رزرو نوبت سریع، ساده و شفاف؛ تجربه‌ای الهام‌گرفته از دقت و ظرافت طراحی اپل برای مدیریت درمان شما.
        </motion.p>
        <motion.div
          variants={variants.actions}
          initial="initial"
          animate="animate"
          className={styles.actions}
        >
          <Link href={bookingHref}>
            <Button variant="primary" size="md">
              رزرو نوبت
            </Button>
          </Link>
          <Link href={stepsHref}>
            <Button variant="secondary" size="md">
              مشاهده مراحل
            </Button>
          </Link>
        </motion.div>
      </div>
    </FrostedCard>
  );
};

export default HeroSection;
