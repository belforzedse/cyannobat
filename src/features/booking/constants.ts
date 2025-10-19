import { type ReasonOption, type ProgressStep } from './types'

export const progressSteps: readonly ProgressStep[] = [
  { key: 'dateTime', label: 'انتخاب تاریخ و ساعت' },
  { key: 'reason', label: 'دلیل مراجعه' },
  { key: 'customer', label: 'اطلاعات تماس' },
]

export const reasonOptions: readonly ReasonOption[] = [
  { value: 'follow_up', label: 'پیگیری روند درمان' },
  { value: 'new_symptom', label: 'ظهور علائم جدید' },
  { value: 'checkup', label: 'چکاپ دوره‌ای' },
  { value: 'second_opinion', label: 'دریافت نظر دوم' },
]

export const schedulePlaceholderMessage =
  'برای نمایش زمان‌های آزاد، ابتدا خدمت دلخواه را انتخاب کنید. ارائه‌دهنده مناسب همراه هر بازه زمانی نمایش داده می‌شود.'

