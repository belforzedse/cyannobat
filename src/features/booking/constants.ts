import { type ReasonOption, type ProgressStep } from './types';

export const progressSteps: readonly ProgressStep[] = [
  { key: 'dateTime', label: 'انتخاب تاریخ و زمان' },
  { key: 'reason', label: 'دلیل مراجعه' },
  { key: 'customer', label: 'اطلاعات تماس' },
];

export const reasonOptions: readonly ReasonOption[] = [
  { value: 'follow_up', label: 'پیگیری روند درمان' },
  { value: 'new_symptom', label: 'بروز علائم جدید' },
  { value: 'checkup', label: 'چکاپ و پیشگیری' },
  { value: 'second_opinion', label: 'دریافت نظر دوم' },
];

export const schedulePlaceholderMessage =
  'برای مشاهده زمان‌های خالی، ابتدا تاریخ مورد نظر را انتخاب کنید.';
