import Link from 'next/link';
import { motion, type MotionProps } from 'framer-motion';
import { Button } from '@/components/ui';

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
    <motion.section
      variants={variants.card}
      initial="initial"
      animate="animate"
      className="glass order-1 relative flex h-full min-h-[420px] flex-col overflow-hidden px-8 pb-16 pt-20 text-right sm:px-12 lg:order-1 lg:px-20"
    >
      <div
        className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-b from-accent/50 via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="absolute -right-32 top-0 h-64 w-64 rounded-full bg-accent/30 blur-3xl"
        aria-hidden
      />
      <div className="flex flex-1 flex-col items-end gap-8">
        <motion.span
          variants={variants.badge}
          initial="initial"
          animate="animate"
          className="rounded-full border border-white/25 bg-white/20 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-inner backdrop-blur-sm dark:bg-white/10"
        >
          سایان نوبت — cyannobat
        </motion.span>
        <motion.h1
          variants={variants.title}
          initial="initial"
          animate="animate"
          className="max-w-3xl text-balance bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl lg:text-7xl"
        >
          سایان نوبت
        </motion.h1>
        <motion.p
          variants={variants.description}
          initial="initial"
          animate="animate"
          className="max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          رزرو نوبت سریع، ساده و شفاف؛ تجربه‌ای الهام‌گرفته از دقت و ظرافت طراحی اپل برای مدیریت درمان شما.
        </motion.p>
        <motion.div
          variants={variants.actions}
          initial="initial"
          animate="animate"
          className="mt-auto flex flex-row-reverse flex-wrap items-center justify-end gap-4 pt-4"
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
    </motion.section>
  );
};

export default HeroSection;
