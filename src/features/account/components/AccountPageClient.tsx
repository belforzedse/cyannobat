'use client'

import { useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, LogOut, Mail } from 'lucide-react'

import { Card, Button } from '@/components/ui'
import GlassIcon from '@/components/GlassIcon'

type Appointment = {
  id: string
  start: string
  end: string
  timeZone: string
  providerName: string
  serviceTitle: string
  status: string
}

type AccountPageClientProps = {
  userEmail: string
  roles: string[]
  isStaff: boolean
  upcomingAppointments: Appointment[]
}

const AccountPageClient = ({ userEmail, roles, isStaff, upcomingAppointments }: AccountPageClientProps) => {
  const prefersReducedMotion = useReducedMotion()

  const handleLogout = useCallback(async () => {
    await fetch('/api/logout', {
      method: 'POST',
    })
    window.location.href = '/login'
  }, [])

  const statusLabels: Record<string, string> = {
    pending: 'در انتظار',
    confirmed: 'تایید شده',
    in_progress: 'در حال انجام',
    completed: 'تکمیل شده',
    cancelled: 'لغو شده',
    no_show: 'عدم حضور',
  }

  return (
    <motion.section
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 text-right sm:px-10"
    >
      <motion.header
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.1, duration: prefersReducedMotion ? 0 : 0.45 }}
        className="flex flex-col gap-3"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">پنل کاربری</span>
        <motion.h1
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
          className="text-3xl font-bold text-foreground sm:text-4xl"
        >
          حساب کاربری
        </motion.h1>

        <motion.p
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
          className="text-sm leading-relaxed text-muted-foreground"
        >
          اطلاعات ورود شما با سیستم رزرو یکپارچه است. نقش‌های فعال: {roles.length > 0 ? roles.join('، ') : 'کاربر مهمان'}.
        </motion.p>
        <motion.div
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.35, duration: prefersReducedMotion ? 0 : 0.45 }}
          className="mt-2 flex justify-end"
        >
          <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            خروج از حساب
          </Button>
        </motion.div>
      </motion.header>

      {/* Staff Redirect Card */}
      {isStaff && (
        <motion.div
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <Card variant="accent" padding="lg" className="flex flex-col gap-4 text-right">
            <h2 className="text-lg font-semibold text-accent">ورود به پیشخوان کارکنان</h2>
            <p className="text-sm leading-6 text-accent/90">
              شما به عنوان عضو کادر درمان وارد شده‌اید. برای مدیریت نوبت‌ها و بازه‌های زمانی، به پیشخوان کارکنان منتقل شوید.
            </p>
            <div className="flex justify-end">
              <Link href="/staff">
                <Button variant="secondary" size="md">
                  رفتن به پیشخوان
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Upcoming Appointments */}
      {!isStaff && (
        <motion.div
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <Card variant="default" padding="lg" className="flex flex-col gap-4 text-right">
            <div className="flex items-center justify-between">
              <GlassIcon icon={Calendar} size="sm" label="نوبت‌های آینده" />
              <h2 className="text-lg font-semibold text-foreground">نوبت‌های آینده</h2>
            </div>

            {upcomingAppointments.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                نوبت فعالی ثبت نشده است. از طریق صفحه رزرو، زمان مناسب خود را انتخاب کنید.
              </p>
            ) : (
              <ul className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <motion.li
                    key={appointment.id}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card variant="subtle" padding="md" className="flex flex-col gap-2 text-right text-sm">
                      <span className="font-semibold text-foreground">{appointment.serviceTitle}</span>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <span>ارائه‌دهنده: {appointment.providerName}</span>
                        <span>زمان: {new Date(appointment.start).toLocaleString('fa-IR', { hour12: false })}</span>
                        <span className="inline-flex items-center gap-2">
                          وضعیت:
                          <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                            {statusLabels[appointment.status] ?? appointment.status}
                          </span>
                        </span>
                      </div>
                    </Card>
                  </motion.li>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>
      )}

      {/* User Info */}
      <motion.div
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.5, duration: prefersReducedMotion ? 0 : 0.5 }}
      >
        <Card variant="default" padding="lg" className="flex flex-col gap-4 text-right">
          <div className="flex items-center justify-between">
            <GlassIcon icon={Mail} size="sm" label="اطلاعات ورود" />
            <h2 className="text-lg font-semibold text-foreground">اطلاعات ورود</h2>
          </div>
          <div className="space-y-2 text-sm leading-6 text-muted-foreground">
            <p>
              ایمیل ثبت شده: <span className="font-semibold text-foreground">{userEmail}</span>
            </p>
            <p>برای تغییر رمز عبور یا به‌روزرسانی اطلاعات تماس، با پشتیبانی هماهنگ کنید.</p>
          </div>
        </Card>
      </motion.div>
    </motion.section>
  )
}

export default AccountPageClient
