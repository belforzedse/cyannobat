'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import BookingInput from '@/components/BookingInput';
import ServiceCard from '@/components/ServiceCard';

const BookingPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedService, setSelectedService] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  return (
    <motion.section
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="glass flex flex-col gap-12 px-8 py-12 text-right sm:px-12 lg:px-16"
    >
      <header className="flex flex-col items-end gap-4">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-muted backdrop-blur-sm dark:bg-white/5"
        >
          آغاز رزرو آنلاین
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
        >
          رزرو نوبت
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-2xl text-balance leading-relaxed text-muted"
        >
          لطفاً اطلاعات مورد نیاز را تکمیل کنید تا گام‌های بعدی برای هماهنگی نوبت در اختیار شما قرار گیرد.
        </motion.p>
      </header>

      <form className="grid gap-8">
        {/* Service Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground">انتخاب خدمت</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: 'general', label: 'مشاوره عمومی' },
              { value: 'cardio', label: 'ویزیت تخصص قلب' },
              { value: 'checkup', label: 'چکاپ دوره‌ای' },
            ].map((service) => (
              <ServiceCard
                key={service.value}
                title={service.label}
                isSelected={selectedService === service.value}
                onClick={() => setSelectedService(service.value)}
                icon="🏥"
              />
            ))}
          </div>
        </motion.div>

        {/* Doctor Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground">انتخاب پزشک</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: 'nasrin', label: 'دکتر نسرین حاتمی', badge: '۱۵ سال تجربه' },
              { value: 'omid', label: 'دکتر امید فرهی', badge: 'متخصص' },
              { value: 'leila', label: 'دکتر لیلا محمدی', badge: 'پرطرفدار' },
            ].map((doctor) => (
              <ServiceCard
                key={doctor.value}
                title={doctor.label}
                badge={doctor.badge}
                isSelected={selectedDoctor === doctor.value}
                onClick={() => setSelectedDoctor(doctor.value)}
                icon="👨‍⚕️"
              />
            ))}
          </div>
        </motion.div>

        {/* Date and Time */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground">تاریخ و زمان</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BookingInput type="date" label="تاریخ" />
            <BookingInput type="time" label="زمان" />
          </div>
        </motion.div>
      </form>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link href="/" className="btn-secondary">
          بازگشت
        </Link>
        <button type="button" className="btn-primary">
          ادامه
        </button>
      </div>
    </motion.section>
  );
};

export default BookingPage;
