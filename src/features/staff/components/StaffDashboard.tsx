'use client'

import React, { useCallback, useMemo, useState, useTransition } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { RefreshCw, LogOut, Loader2, Calendar, Users } from 'lucide-react'

import type { StaffAppointment, StaffProvider, StaffUser } from '@/features/staff/types'
import { useToast } from '@/components/ui/ToastProvider'
import { Card, Button } from '@/components/ui'
import GlassIcon from '@/components/GlassIcon'
import {
  GlobalLoadingOverlayProvider,
  useGlobalLoadingOverlay,
} from '@/components/GlobalLoadingOverlayProvider'

type StaffDashboardProps = {
  initialAppointments: StaffAppointment[]
  initialProviders: StaffProvider[]
  currentUser: StaffUser
}

const statusOptions: Array<{ value: StaffAppointment['status']; label: string }> = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'confirmed', label: 'تایید شده' },
  { value: 'in_progress', label: 'در حال انجام' },
  { value: 'completed', label: 'تکمیل شده' },
  { value: 'cancelled', label: 'لغو شده' },
  { value: 'no_show', label: 'عدم حضور' },
]

const formatDateTime = (iso: string, timeZone: string) => {
  try {
    const date = new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso))
    const time = new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timeZone || 'UTC',
    }).format(new Date(iso))
    return `${date} — ${time}`
  } catch {
    return iso
  }
}

const StaffDashboardContent = ({ initialAppointments, initialProviders, currentUser }: StaffDashboardProps) => {
  const prefersReducedMotion = useReducedMotion()
  const [appointments, setAppointments] = useState<StaffAppointment[]>(initialAppointments)
  const [providers] = useState<StaffProvider[]>(initialProviders)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, startRefreshTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [failedId, setFailedId] = useState<string | null>(null)
  const { showToast } = useToast()
  const { setActivity } = useGlobalLoadingOverlay()

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      if (filterStatus !== 'all' && appointment.status !== filterStatus) {
        return false
      }
      if (searchTerm.trim().length > 0) {
        const term = searchTerm.trim().toLowerCase()
        return (
          appointment.clientEmail.toLowerCase().includes(term) ||
          appointment.providerName.toLowerCase().includes(term) ||
          (appointment.reference ?? '').toLowerCase().includes(term)
        )
      }
      return true
    })
  }, [appointments, filterStatus, searchTerm])

  const handleRefresh = useCallback(() => {
    setActivity('staff-refresh', true, 'در حال به‌روزرسانی نوبت‌ها...')
    startRefreshTransition(async () => {
      try {
        setErrorMessage(null)
        const response = await fetch('/api/staff/appointments', {
          cache: 'no-store',
        })
        if (!response.ok) {
          throw new Error(`Failed to refresh appointments (${response.status})`)
        }
        const result = (await response.json()) as { appointments: StaffAppointment[] }
        setAppointments(result.appointments)
        setFailedId(null)
        showToast({ description: 'فهرست نوبت‌ها به‌روزرسانی شد.', variant: 'success' })
      } catch (error) {
        console.error(error)
        setErrorMessage('به‌روزرسانی فهرست نوبت‌ها با مشکل مواجه شد.')
        showToast({ description: 'به‌روزرسانی فهرست نوبت‌ها با مشکل مواجه شد.', variant: 'error' })
      } finally {
        setActivity('staff-refresh', false)
      }
    })
  }, [setActivity, showToast])

  const handleStatusChange = useCallback(
    async (appointmentId: string, status: StaffAppointment['status']) => {
      setUpdatingId(appointmentId)
      setErrorMessage(null)
      setActivity(`staff-status-${appointmentId}`, true, 'در حال ذخیره تغییر وضعیت...')
      try {
        const response = await fetch(`/api/staff/appointments/${appointmentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        })
        if (!response.ok) {
          throw new Error(`Failed to update appointment (${response.status})`)
        }
        const result = (await response.json()) as { appointment: StaffAppointment }
        setAppointments((current) =>
          current.map((appointment) => (appointment.id === appointmentId ? result.appointment : appointment)),
        )
        setFailedId(null)
        showToast({ description: 'وضعیت نوبت با موفقیت ذخیره شد.', variant: 'success' })
      } catch (error) {
        console.error(error)
        setErrorMessage('ذخیره وضعیت جدید ممکن نشد.')
        setFailedId(appointmentId)
        showToast({ description: 'ذخیره وضعیت جدید ممکن نشد.', variant: 'error' })
      } finally {
        setUpdatingId(null)
        setActivity(`staff-status-${appointmentId}`, false)
      }
    },
    [setActivity, showToast],
  )

  const handleLogout = useCallback(async () => {
    await fetch('/api/staff/logout', {
      method: 'POST',
    })
    window.location.href = '/staff/login'
  }, [])

  return (
    <motion.div
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="flex flex-col gap-8"
    >
      {/* Header Card */}
      <div className="glass relative overflow-hidden px-4 py-8 text-right sm:px-10 sm:py-12 lg:px-16">
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <motion.span
              initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.1, duration: prefersReducedMotion ? 0 : 0.45 }}
              className="inline-block rounded-full border border-white/25 bg-white/20 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm dark:border-white/15 dark:bg-white/10"
            >
              پنل مدیریت
            </motion.span>

            <motion.h1
              initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="mt-4 bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
            >
              پیشخوان کارکنان
            </motion.h1>

            <motion.p
              initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="mt-3 max-w-2xl text-balance leading-relaxed text-muted-foreground"
            >
              مدیریت نوبت‌ها و بازه‌های زمانی از یک داشبورد اختصاصی.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0 : 0.5 }}
            className="flex flex-col items-end gap-3"
          >
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{currentUser.email}</span>
              <span className="mx-2 text-muted-foreground/70">•</span>
              <span>{currentUser.roles.join(', ')}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Appointments Section */}
      <motion.div
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.5, duration: prefersReducedMotion ? 0 : 0.5 }}
      >
        <Card variant="default" padding="md" className="sm:p-8">
          <div className="flex flex-col items-end gap-1 text-right">
            <div className="flex w-full items-center justify-between">
              <GlassIcon icon={Calendar} size="sm" label="مدیریت نوبت‌ها" />
              <h2 className="text-lg font-semibold text-foreground">مدیریت نوبت‌ها</h2>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">وضعیت نوبت</label>
                <select
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                  className="glass-panel rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">جستجوی سریع</label>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ایمیل، ارائه‌دهنده یا کد پیگیری"
                  className="glass-panel w-full rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 sm:w-64"
                />
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              به‌روزرسانی
            </Button>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
              {errorMessage}
            </div>
          )}

          {/* Appointments Table */}
          <div className="mt-6 space-y-6">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-white/10 text-right text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 lg:px-4">زمان نوبت</th>
                    <th className="px-3 py-3 lg:px-4">بیمار</th>
                    <th className="px-3 py-3 lg:px-4">ارائه‌دهنده</th>
                    <th className="px-3 py-3 lg:px-4">خدمت</th>
                    <th className="px-3 py-3 lg:px-4">کد پیگیری</th>
                    <th className="px-3 py-3 lg:px-4">تاریخ ایجاد</th>
                    <th className="px-3 py-3 lg:px-4">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-foreground">
                  {filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className={`transition-colors hover:bg-white/5 focus-within:bg-white/10 ${
                        failedId === appointment.id ? 'bg-red-100 dark:bg-red-500/20' : ''
                      }`}
                    >
                      <td className="px-3 py-3 text-xs font-medium lg:px-4">
                        {formatDateTime(appointment.start, appointment.timeZone)}
                        <span className="block text-[11px] text-muted-foreground">
                          تا {formatDateTime(appointment.end, appointment.timeZone).split('—')[1]?.trim() ?? ''}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs lg:px-4">{appointment.clientEmail}</td>
                      <td className="px-3 py-3 text-xs lg:px-4">{appointment.providerName}</td>
                      <td className="px-3 py-3 text-xs lg:px-4">{appointment.serviceTitle}</td>
                      <td className="px-3 py-3 text-xs lg:px-4">{appointment.reference ?? '—'}</td>
                      <td className="px-3 py-3 text-[11px] text-muted-foreground lg:px-4">
                        {formatDateTime(appointment.createdAt, appointment.timeZone)}
                      </td>
                      <td className="px-3 py-3 lg:px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={appointment.status}
                            onChange={(event) =>
                              handleStatusChange(appointment.id, event.target.value as StaffAppointment['status'])
                            }
                            disabled={updatingId === appointment.id}
                            className="glass-panel rounded-full px-3 py-1 text-xs font-semibold text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-accent/40"
                          >
                            {statusOptions.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          {updatingId === appointment.id && (
                            <Loader2
                              data-testid={`status-spinner-${appointment.id}`}
                              className="h-4 w-4 animate-spin text-muted-foreground"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAppointments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        نوبتی با این شرایط یافت نشد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`glass-panel rounded-2xl p-4 text-right shadow-sm transition-colors ${
                      failedId === appointment.id ? 'border border-red-300/60 bg-red-50 dark:border-red-400/60 dark:bg-red-500/20' :
                      'border border-white/10 bg-white/10 dark:border-white/10'
                    }`}
                  >
                    <div className="flex flex-col gap-3 text-sm text-foreground">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground">زمان نوبت</span>
                        <span className="font-medium">
                          {formatDateTime(appointment.start, appointment.timeZone)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          تا {formatDateTime(appointment.end, appointment.timeZone).split('—')[1]?.trim() ?? ''}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground">بیمار</span>
                        <span>{appointment.clientEmail}</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground">ارائه‌دهنده</span>
                        <span>{appointment.providerName}</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground">خدمت</span>
                        <span>{appointment.serviceTitle}</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground">کد پیگیری</span>
                        <span>{appointment.reference ?? '—'}</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground">تاریخ ایجاد</span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDateTime(appointment.createdAt, appointment.timeZone)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">وضعیت</span>
                        <div className="flex items-center justify-between gap-3">
                          <select
                            value={appointment.status}
                            onChange={(event) =>
                              handleStatusChange(appointment.id, event.target.value as StaffAppointment['status'])
                            }
                            disabled={updatingId === appointment.id}
                            className="glass-panel flex-1 rounded-full px-3 py-2 text-xs font-semibold text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-accent/40"
                          >
                            {statusOptions.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          {updatingId === appointment.id && (
                            <Loader2
                              data-testid={`status-spinner-${appointment.id}`}
                              className="h-5 w-5 animate-spin text-muted-foreground"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/20 bg-white/10 p-6 text-center text-sm text-muted-foreground dark:border-white/10">
                  نوبتی با این شرایط یافت نشد.
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Providers Section */}
      <motion.div
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.6, duration: prefersReducedMotion ? 0 : 0.5 }}
      >
        <Card variant="default" padding="md" className="sm:p-8">
          <div className="flex flex-col items-end gap-1 text-right">
            <div className="flex w-full items-center justify-between">
              <GlassIcon icon={Users} size="sm" label="بازه‌های زمانی ارائه‌دهندگان" />
              <h2 className="text-lg font-semibold text-foreground">بازه‌های زمانی ارائه‌دهندگان</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              برای تعریف بازه‌های جدید یا ویرایش، به بخش مربوطه در سیستم مدیریت مراجعه کنید.
            </p>
          </div>

          <div className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <Card
                key={provider.id}
                variant="subtle"
                padding="sm"
                className="transition-transform hover:scale-[1.02] sm:p-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{provider.displayName}</span>
                  <span className="text-[11px] text-muted-foreground">منطقه زمانی: {provider.timeZone}</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {provider.availability.length > 0 ? (
                    provider.availability.map((window, index) => (
                      <li
                        key={`${provider.id}-${window.day}-${index}`}
                        className="glass-panel rounded-xl px-3 py-2 text-[11px] text-muted-foreground"
                      >
                        <span className="font-semibold text-foreground">{window.day}</span>
                        <span className="mx-1 text-muted-foreground/60">—</span>
                        <span>
                          {window.startTime} تا {window.endTime}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-xl border border-dashed border-white/20 px-3 py-2 text-[11px] text-muted-foreground dark:border-white/15">
                      بازه‌ای ثبت نشده است.
                    </li>
                  )}
                </ul>
              </Card>
            ))}
            {providers.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-white/20 bg-white/10 p-6 text-center text-sm text-muted-foreground dark:border-white/10">
                هنوز پروفایل ارائه‌دهنده‌ای ثبت نشده است.
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

const StaffDashboard = (props: StaffDashboardProps) => (
  <GlobalLoadingOverlayProvider>
    <StaffDashboardContent {...props} />
  </GlobalLoadingOverlayProvider>
)

export default StaffDashboard
