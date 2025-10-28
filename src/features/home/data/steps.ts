import type { LucideIcon } from 'lucide-react';
import { Calendar, CheckCircle2, Search } from 'lucide-react';

export type BookingStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const bookingSteps: BookingStep[] = [
  {
    title: 'انتخاب خدمت',
    description: 'از میان خدمات تخصصی و بسته‌های سفارشی‌شده، بهترین گزینه را برای نیاز خود برگزینید.',
    icon: Search,
  },
  {
    title: 'انتخاب تاریخ و زمان',
    description: 'بازه دلخواه خود را از میان زمان‌های آزاد انتخاب کنید؛ ارائه‌دهنده مناسب با همان بازه هماهنگ است.',
    icon: Calendar,
  },
  {
    title: 'تایید جزئیات',
    description: 'اطلاعات تماس و خلاصه نوبت را مرور کنید و پیش از ثبت نهایی، همه چیز را یک‌جا تایید نمایید.',
    icon: CheckCircle2,
  },
];
