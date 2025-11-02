'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { Input, Textarea, Card } from '@/components/ui';
import { luxuryContainer, luxuryPresets, luxurySlideFade } from '@/lib/luxuryAnimations';
import { type CustomerInfo } from '@/lib/booking/types';

type ContactSectionProps = {
  customerInfo: CustomerInfo;
  onCustomerChange: (field: keyof CustomerInfo, value: string) => void;
  customerNotes: string;
  onCustomerNotesChange: (value: string) => void;
};

const ContactSection = ({
  customerInfo,
  onCustomerChange,
  customerNotes,
  onCustomerNotesChange,
}: ContactSectionProps) => {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion);

  const sectionVariants = reduceMotion ? undefined : luxuryPresets.whisper('up');
  const fieldsContainerVariants = reduceMotion ? undefined : luxuryContainer;
  const fieldVariants = reduceMotion
    ? undefined
    : luxurySlideFade('up', {
        distance: 16,
        duration: 0.5,
        delayIn: 0.05,
      });

  const motionStates = reduceMotion
    ? {}
    : { initial: 'initial' as const, animate: 'animate' as const };

  return (
    <motion.section variants={sectionVariants} {...motionStates}>
      <Card variant="default" padding="lg" className="sm:rounded-3xl">
        <div className="flex flex-col items-end gap-1 sm:gap-2 text-right">
          <h3 className="text-sm font-semibold text-foreground">اطلاعات تماس</h3>
          <p className="text-xs leading-6 text-muted-foreground">
            لطفاً راه‌های ارتباطی خود را وارد کنید تا هماهنگی‌ها سریع‌تر انجام شود.
          </p>
        </div>
        <motion.div
          className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-3 sm:gap-4 lg:mt-5"
          variants={fieldsContainerVariants}
          {...motionStates}
        >
          <motion.div variants={fieldVariants}>
            <Input
              label="نام و نام خانوادگی"
              name="fullName"
              value={customerInfo.fullName}
              onChange={(event) => onCustomerChange('fullName', event.target.value)}
              placeholder="مثلاً سارا محمدی"
            />
          </motion.div>
          <motion.div variants={fieldVariants}>
            <Input
              label="ایمیل"
              type="email"
              name="email"
              value={customerInfo.email}
              onChange={(event) => onCustomerChange('email', event.target.value)}
              placeholder="you@example.com"
            />
          </motion.div>
          <motion.div variants={fieldVariants}>
            <Input
              label="شماره تماس"
              type="tel"
              name="phone"
              value={customerInfo.phone}
              onChange={(event) => onCustomerChange('phone', event.target.value)}
              placeholder="0912 xxx xxxx"
            />
          </motion.div>
        </motion.div>
        <motion.div variants={fieldVariants} {...motionStates} className="mt-4 sm:mt-5">
          <Textarea
            label="یادداشت برای تیم پشتیبانی"
            value={customerNotes}
            onChange={(event) => onCustomerNotesChange(event.target.value)}
            placeholder="اگر نکته‌ای لازم است پیش از نوبت بدانیم اینجا بنویسید"
          />
        </motion.div>
      </Card>
    </motion.section>
  );
};

export default ContactSection;
