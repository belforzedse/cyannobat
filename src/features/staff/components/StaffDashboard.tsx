'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'

import clsx from 'clsx'
import { RefreshCw, LogOut } from 'lucide-react'

import type { StaffAppointment, StaffProvider, StaffUser } from '@/features/staff/types'

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

const StaffDashboard = ({ initialAppointments, initialProviders, currentUser }: StaffDashboardProps) => {
  const [appointments, setAppointments] = useState<StaffAppointment[]>(initialAppointments)
  const [providers] = useState<StaffProvider[]>(initialProviders)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, startRefreshTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
      } catch (error) {
        console.error(error)
        setErrorMessage('به‌روزرسانی فهرست نوبت‌ها با مشکل مواجه شد.')
      }
    })
  }, [])

  const handleStatusChange = useCallback(async (appointmentId: string, status: StaffAppointment['status']) => {
    setUpdatingId(appointmentId)
    setErrorMessage(null)
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
      setAppointments((current) => current.map((appointment) => (appointment.id === appointmentId ? result.appointment : appointment)))
    } catch (error) {
      console.error(error)
      setErrorMessage('ذخیره وضعیت جدید ممکن نشد.')
    } finally {
      setUpdatingId(null)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    await fetch('/api/staff/logout', {
      method: 'POST',
    })
    window.location.href = '/staff/login'
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col-reverse gap-3 rounded-2xl border border-white/20 bg-white/40 p-4 text-right shadow-sm dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground">پیشخوان کارکنان</h1>
          <p className="text-sm text-muted-foreground">مدیریت نوبت‌ها و بازه‌های زمانی از یک داشبورد اختصاصی.</p>
        </div>
        <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{currentUser.email}</span>
            <span className="mx-2 text-muted-foreground/70">•</span>
            <span>{currentUser.roles.join(', ')}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/30 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600 dark:border-white/15 dark:bg-white/10 dark:hover:border-red-400/60 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            خروج
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-white/20 bg-white/35 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label className="text-xs font-medium text-muted-foreground">
              وضعیت نوبت
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/30 bg-white/60 px-3 py-2 text-sm text-foreground dark:border-white/20 dark:bg-white/10 sm:mr-3 sm:w-40"
              >
                <option value="all">همه وضعیت‌ها</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-medium text-muted-foreground">
              جستجوی سریع
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="ایمیل بیمار، ارائه‌دهنده یا کد پیگیری"
                className="mt-1 w-full rounded-xl border border-white/30 bg-white/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground dark:border-white/20 dark:bg-white/10 sm:mr-3 sm:w-64"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 self-end rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-colors hover:border-accent/60 hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={clsx('h-4 w-4', isRefreshing && 'animate-spin')} />
            به‌روزرسانی
          </button>
        </div>

        {errorMessage ? <p className="mt-4 rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">{errorMessage}</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20 text-sm text-right">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">زمان نوبت</th>
                <th className="px-4 py-3">بیمار</th>
                <th className="px-4 py-3">ارائه‌دهنده</th>
                <th className="px-4 py-3">خدمت</th>
                <th className="px-4 py-3">کد پیگیری</th>
                <th className="px-4 py-3">تاریخ ایجاد</th>
                <th className="px-4 py-3">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-foreground">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="transition-colors hover:bg-white/30 dark:hover:bg-white/5">
                  <td className="px-4 py-3 text-xs font-medium">
                    {formatDateTime(appointment.start, appointment.timeZone)}
                    <span className="block text-[11px] text-muted-foreground">
                      تا {formatDateTime(appointment.end, appointment.timeZone).split('—')[1]?.trim() ?? ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{appointment.clientEmail}</td>
                  <td className="px-4 py-3 text-xs">{appointment.providerName}</td>
                  <td className="px-4 py-3 text-xs">{appointment.serviceTitle}</td>
                  <td className="px-4 py-3 text-xs">{appointment.reference ?? '—'}</td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground">
                    {formatDateTime(appointment.createdAt, appointment.timeZone)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={appointment.status}
                      onChange={(event) => handleStatusChange(appointment.id, event.target.value as StaffAppointment['status'])}
                      disabled={updatingId === appointment.id}
                      className="rounded-full border border-white/25 bg-white/55 px-3 py-1 text-xs font-semibold text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-white/10"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    نوبتی با این شرایط یافت نشد.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-white/20 bg-white/35 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
        <div className="flex flex-col items-end gap-1 text-right">
          <h2 className="text-lg font-semibold text-foreground">بازه‌های زمانی ارائه‌دهندگان</h2>
          <p className="text-xs text-muted-foreground">برای تعریف بازه‌های جدید یا ویرایش، به بخش مربوطه در سیستم مدیریت مراجعه کنید.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="rounded-2xl border border-white/25 bg-white/45 p-4 text-xs text-right shadow-sm transition-all hover:border-accent/50 hover:bg-white/60 dark:border-white/15 dark:bg-white/10 dark:hover:border-accent/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{provider.displayName}</span>
                <span className="text-[11px] text-muted-foreground">منطقه زمانی: {provider.timeZone}</span>
              </div>
              <ul className="mt-3 space-y-2">
                {provider.availability.length > 0 ? (
                  provider.availability.map((window, index) => (
                    <li key={`${provider.id}-${window.day}-${index}`} className="rounded-xl border border-white/20 bg-white/40 px-3 py-2 text-[11px] text-muted-foreground dark:border-white/15 dark:bg-white/5">
                      <span className="font-semibold text-foreground">{window.day}</span>
                      <span className="mx-1 text-muted-foreground/60">—</span>
                      <span>{window.startTime} تا {window.endTime}</span>
                    </li>
                  ))
                ) : (
                  <li className="rounded-xl border border-dashed border-white/20 px-3 py-2 text-[11px] text-muted-foreground dark:border-white/15">
                    بازه‌ای ثبت نشده است.
                  </li>
                )}
              </ul>
            </div>
          ))}
          {providers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/20 p-6 text-center text-sm text-muted-foreground dark:border-white/10">
              هنوز پروفایل ارائه‌دهنده‌ای ثبت نشده است.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default StaffDashboard

