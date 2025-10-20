'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Mail } from 'lucide-react'

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
      className="relative flex flex-col gap-8"
    >
      {/* Header Card */}
      <div className="glass relative overflow-hidden px-8 py-12 text-right sm:px-12 lg:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-accent/25 blur-[140px] sm:-left-16 dark:bg-accent/35"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-16 h-80 w-80 rounded-full bg-accent-strong/25 blur-[150px] dark:bg-accent-strong/35"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70 dark:via-white/20"
        />

        <motion.span
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.1, duration: prefersReducedMotion ? 0 : 0.45 }}
          className="inline-block rounded-full border border-white/25 bg-white/20 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm dark:border-white/15 dark:bg-white/10"
        >
          پنل کاربری
        </motion.span>

        <motion.h1
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
          className="mt-4 bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
        >
          حساب کاربری
        </motion.h1>

        <motion.p
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
          className="mt-3 max-w-2xl text-balance leading-relaxed text-muted-foreground"
        >
          اطلاعات ورود شما با سیستم رزرو یکپارچه است. نقش‌های فعال: {roles.length > 0 ? roles.join('، ') : 'کاربر مهمان'}.
        </motion.p>
      </div>

      {/* Staff Redirect Card */}
      {isStaff && (
        <motion.div
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <Card variant="accent" padding="lg">
            <div className="flex flex-col items-end gap-4 text-right">
              <h2 className="text-lg font-semibold text-accent">ورود به پیشخوان کارکنان</h2>
              <p className="text-sm text-accent/90">
                شما به عنوان عضو کادر درمان وارد شده‌اید. برای مدیریت نوبت‌ها و بازه‌های زمانی، به پیشخوان کارکنان منتقل
                شوید.
              </p>
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
          <Card variant="default" padding="lg">
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="flex w-full items-center justify-between">
                <GlassIcon icon={Calendar} size="sm" label="نوبت‌های آینده" />
                <h2 className="text-lg font-semibold text-foreground">نوبت‌های آینده</h2>
              </div>
            </div>

            {upcomingAppointments.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                نوبت فعالی ثبت نشده است. از طریق صفحه رزرو، زمان مناسب خود را انتخاب کنید.
              </p>
            ) : (
              <ul className="mt-6 space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <motion.li
                    key={appointment.id}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card variant="subtle" padding="md">
                      <div className="flex flex-col gap-2 text-right text-sm">
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
        <Card variant="default" padding="lg">
          <div className="flex flex-col items-end gap-1 text-right">
            <div className="flex w-full items-center justify-between">
              <GlassIcon icon={Mail} size="sm" label="اطلاعات ورود" />
              <h2 className="text-lg font-semibold text-foreground">اطلاعات ورود</h2>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
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
