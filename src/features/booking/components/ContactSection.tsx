'use client';

import BookingInput from '@/components/BookingInput';
import { type CustomerInfo } from '../types';

import GlassSection from './GlassSection';

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
}: ContactSectionProps) => (
  <GlassSection>
    <div className="flex flex-col items-end gap-1 sm:gap-2 text-right">
      <h3 className="text-sm font-semibold text-foreground">اطلاعات تماس</h3>
      <p className="text-xs leading-6 text-muted-foreground">لطفاً راه‌های ارتباطی خود را وارد کنید تا هماهنگی‌ها سریع‌تر انجام شود.</p>
    </div>
    <div className="mt-3 sm:mt-4 lg:mt-5 grid gap-3 sm:gap-4 sm:grid-cols-3">
      <BookingInput
        label="نام و نام خانوادگی"
        name="fullName"
        value={customerInfo.fullName}
        onChange={(event) => onCustomerChange('fullName', event.target.value)}
        placeholder="مثلاً سارا محمدی"
      />
      <BookingInput
        label="ایمیل"
        type="email"
        name="email"
        value={customerInfo.email}
        onChange={(event) => onCustomerChange('email', event.target.value)}
        placeholder="you@example.com"
      />
      <BookingInput
        label="شماره تماس"
        type="tel"
        name="phone"
        value={customerInfo.phone}
        onChange={(event) => onCustomerChange('phone', event.target.value)}
        placeholder="0912 xxx xxxx"
      />
    </div>
    <div className="mt-4 sm:mt-5">
      <label htmlFor="customer-notes" className="text-sm font-medium text-foreground text-right">
        یادداشت برای تیم پشتیبانی
      </label>
      <textarea
        id="customer-notes"
        value={customerNotes}
        onChange={(event) => onCustomerNotesChange(event.target.value)}
        className="mt-2 min-h-[100px] w-full rounded-xl border border-white/20 bg-white/50 px-4 py-3 text-right text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 hover:border-white/30 hover:bg-white/60 focus:border-accent focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/12 dark:bg-white/10 dark:hover:border-white/20 dark:hover:bg-white/15 dark:focus:border-accent/50 dark:focus:bg-white/20"
        placeholder="اگر نکته‌ای لازم است پیش از نوبت بدانیم اینجا بنویسید"
      />
    </div>
  </GlassSection>
);

export default ContactSection;
