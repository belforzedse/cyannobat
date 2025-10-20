'use client';

import { Input, Textarea, Card } from '@/components/ui';
import { type CustomerInfo } from '../types';

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
  <Card variant="default" padding="lg" className="sm:rounded-3xl">
    <div className="flex flex-col items-end gap-1 sm:gap-2 text-right">
      <h3 className="text-sm font-semibold text-foreground">اطلاعات تماس</h3>
      <p className="text-xs leading-6 text-muted-foreground">لطفاً راه‌های ارتباطی خود را وارد کنید تا هماهنگی‌ها سریع‌تر انجام شود.</p>
    </div>
    <div className="mt-3 sm:mt-4 lg:mt-5 grid gap-3 sm:gap-4 sm:grid-cols-3">
      <Input
        label="نام و نام خانوادگی"
        name="fullName"
        value={customerInfo.fullName}
        onChange={(event) => onCustomerChange('fullName', event.target.value)}
        placeholder="مثلاً سارا محمدی"
      />
      <Input
        label="ایمیل"
        type="email"
        name="email"
        value={customerInfo.email}
        onChange={(event) => onCustomerChange('email', event.target.value)}
        placeholder="you@example.com"
      />
      <Input
        label="شماره تماس"
        type="tel"
        name="phone"
        value={customerInfo.phone}
        onChange={(event) => onCustomerChange('phone', event.target.value)}
        placeholder="0912 xxx xxxx"
      />
    </div>
    <Textarea
      label="یادداشت برای تیم پشتیبانی"
      className="mt-4 sm:mt-5"
      value={customerNotes}
      onChange={(event) => onCustomerNotesChange(event.target.value)}
      placeholder="اگر نکته‌ای لازم است پیش از نوبت بدانیم اینجا بنویسید"
    />
  </Card>
);

export default ContactSection;
