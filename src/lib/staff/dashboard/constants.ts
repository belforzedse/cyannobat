import type { StaffAppointment } from '@/lib/staff/types'

import type { DashboardMode } from './types'

export type StatusOption = { value: StaffAppointment['status']; label: string }

export const statusOptions: StatusOption[] = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'confirmed', label: 'تایید شده' },
  { value: 'in_progress', label: 'در حال انجام' },
  { value: 'completed', label: 'تکمیل شده' },
  { value: 'cancelled', label: 'لغو شده' },
  { value: 'no_show', label: 'عدم حضور' },
]

export const dashboardCopy: Record<DashboardMode, { title: string; description: string }> = {
  doctor: {
    title: 'پیشخوان پزشک',
    description: 'پیگیری نوبت‌های بیماران و به‌روزرسانی وضعیت مراجعه‌های شما.',
  },
  receptionist: {
    title: 'پیشخوان پذیرش',
    description: 'مدیریت صف نوبت‌ها، هماهنگی ارائه‌دهندگان و پشتیبانی بیماران.',
  },
}

export const searchPlaceholderByMode: Record<DashboardMode, string> = {
  doctor: 'ایمیل بیمار یا کد پیگیری',
  receptionist: 'ایمیل، ارائه‌دهنده یا کد پیگیری',
}

export const providerCardCopy: Record<DashboardMode, { iconLabel: string; description: string; title: string }> = {
  doctor: {
    iconLabel: 'بازه‌های زمانی شما',
    title: 'مدیریت برنامه زمانی',
    description: 'بازه‌های حضور خود را تنظیم کنید. تغییرات بلافاصله در دسترس تیم پذیرش قرار می‌گیرد.',
  },
  receptionist: {
    iconLabel: 'برنامه ارائه‌دهندگان',
    title: 'مدیریت بازه‌های ارائه‌دهندگان',
    description: 'بازه‌های زمانی ارائه‌دهندگان را ویرایش یا اضافه کنید تا تقویم همیشه به‌روز باشد.',
  },
}
