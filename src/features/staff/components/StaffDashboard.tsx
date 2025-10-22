'use client'

import React, { useCallback, useMemo, useState, useTransition } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { RefreshCw, LogOut, Loader2, Calendar, Users, Plus, X, Edit3 } from 'lucide-react'

import type { StaffAppointment, StaffProvider, StaffUser } from '@/features/staff/types'
import { useToast } from '@/components/ui/ToastProvider'
import { Card, Button, Input } from '@/components/ui'
import GlassIcon from '@/components/GlassIcon'
import {
  GlobalLoadingOverlayProvider,
  useGlobalLoadingOverlay,
} from '@/components/GlobalLoadingOverlayProvider'
import { getRoleLabel } from '@/features/staff/utils/roleLabels'
import ProviderAvailabilityEditor from './ProviderAvailabilityEditor'
import StaffUserCreationCard from './StaffUserCreationCard'

type SharedDashboardProps = {
  initialAppointments: StaffAppointment[]
  initialProviders: StaffProvider[]
  currentUser: StaffUser
}

type DashboardMode = 'doctor' | 'receptionist'

type StaffDashboardProps = SharedDashboardProps & {
  mode: DashboardMode
}

const statusOptions: Array<{ value: StaffAppointment['status']; label: string }> = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'confirmed', label: 'تایید شده' },
  { value: 'in_progress', label: 'در حال انجام' },
  { value: 'completed', label: 'تکمیل شده' },
  { value: 'cancelled', label: 'لغو شده' },
  { value: 'no_show', label: 'عدم حضور' },
]

type UnknownRecord = Record<string, unknown>

const getRelationDoc = (relation: unknown): UnknownRecord | null => {
  if (!relation || typeof relation !== 'object') {
    return null
  }

  const record = relation as UnknownRecord

  if ('relationTo' in record && 'value' in record) {
    const value = record.value
    return value && typeof value === 'object' ? (value as UnknownRecord) : null
  }

  return record
}

const toStaffAppointment = (doc: UnknownRecord): StaffAppointment => {
  const schedule = typeof doc.schedule === 'object' && doc.schedule !== null ? (doc.schedule as UnknownRecord) : {}
  const provider = getRelationDoc(doc.provider)
  const service = getRelationDoc(doc.service)
  const client = getRelationDoc(doc.client)

  const start = typeof doc.start === 'string' ? doc.start : (schedule.start as string | undefined)
  const end = typeof doc.end === 'string' ? doc.end : (schedule.end as string | undefined)
  const timeZone =
    typeof doc.timeZone === 'string' ? doc.timeZone : (schedule.timeZone as string | undefined) ?? 'UTC'

  let createdAt: string
  if (typeof doc.createdAt === 'string') {
    createdAt = doc.createdAt
  } else if (doc.createdAt instanceof Date && !Number.isNaN(doc.createdAt.getTime())) {
    createdAt = doc.createdAt.toISOString()
  } else {
    createdAt = new Date().toISOString()
  }

  return {
    id: typeof doc.id === 'string' ? doc.id : String(doc.id ?? ''),
    reference: typeof doc.reference === 'string' ? doc.reference : (doc.reference as string | null | undefined) ?? null,
    status: typeof doc.status === 'string' ? doc.status : 'pending',
    start: start ?? '',
    end: end ?? '',
    timeZone,
    providerName: typeof doc.providerName === 'string' ? doc.providerName : (provider?.displayName as string | undefined) ?? 'نامشخص',
    serviceTitle: typeof doc.serviceTitle === 'string' ? doc.serviceTitle : (service?.title as string | undefined) ?? 'خدمت بدون عنوان',
    clientEmail: typeof doc.clientEmail === 'string' ? doc.clientEmail : (client?.email as string | undefined) ?? 'نامشخص',
    createdAt,
  }
}

const mapAppointmentFromApi = (doc: unknown): StaffAppointment => {
  if (!doc || typeof doc !== 'object') {
    return toStaffAppointment({})
  }

  const record = doc as UnknownRecord

  if (
    typeof record.start === 'string' &&
    typeof record.end === 'string' &&
    typeof record.timeZone === 'string' &&
    typeof record.clientEmail === 'string'
  ) {
    return toStaffAppointment(record)
  }

  return toStaffAppointment(record)
}

const getTimeValue = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime()
}

const sortAppointmentsByStart = (items: StaffAppointment[]) =>
  [...items].sort((a, b) => getTimeValue(a.start) - getTimeValue(b.start))

const toInputValue = (iso: string) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 16)
}

const toISOStringOrNull = (value: string): string | null => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

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

const dashboardCopy: Record<DashboardMode, { title: string; description: string }> = {
  doctor: {
    title: 'پیشخوان پزشک',
    description: 'پیگیری نوبت‌های بیماران و به‌روزرسانی وضعیت مراجعه‌های شما.',
  },
  receptionist: {
    title: 'پیشخوان پذیرش',
    description: 'مدیریت صف نوبت‌ها، هماهنگی ارائه‌دهندگان و پشتیبانی بیماران.',
  },
}

const searchPlaceholderByMode: Record<DashboardMode, string> = {
  doctor: 'ایمیل بیمار یا کد پیگیری',
  receptionist: 'ایمیل، ارائه‌دهنده یا کد پیگیری',
}

const providerCardCopy: Record<DashboardMode, { iconLabel: string; description: string; title: string }> = {
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

const StaffDashboardContent = ({
  initialAppointments,
  initialProviders,
  currentUser,
  mode,
}: StaffDashboardProps) => {
  const prefersReducedMotion = useReducedMotion()
  const [appointments, setAppointments] = useState<StaffAppointment[]>(initialAppointments)
  const [providers, setProviders] = useState<StaffProvider[]>(initialProviders)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, startRefreshTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [failedId, setFailedId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    clientId: '',
    serviceId: '',
    providerId: '',
    start: '',
    end: '',
    timeZone: '',
  })
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)
  const [scheduleForm, setScheduleForm] = useState({ start: '', end: '' })
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [isSavingSchedule, setIsSavingSchedule] = useState(false)
  const { showToast } = useToast()
  const { setActivity } = useGlobalLoadingOverlay()

  const canCreateAppointments = useMemo(
    () => currentUser.roles.includes('receptionist'),
    [currentUser.roles],
  )

  const providerLookup = useMemo(() => {
    const map = new Map<string, StaffProvider>()
    providers.forEach((provider) => {
      map.set(provider.id, provider)
    })
    return map
  }, [providers])

  const upsertAppointment = useCallback((appointment: StaffAppointment) => {
    setAppointments((current) => {
      const filtered = current.filter((item) => item.id !== appointment.id)
      return sortAppointmentsByStart([...filtered, appointment])
    })
  }, [])
  const showProviderColumn = mode === 'receptionist'
  const isAdmin = currentUser.roles.includes('admin')
  const showUserManagement = mode === 'receptionist' || isAdmin
  const totalColumns = showProviderColumn ? 7 : 6

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

  const refreshProviders = useCallback(async (): Promise<StaffProvider[]> => {
    setActivity('staff-providers-refresh', true, 'در حال به‌روزرسانی بازه‌های زمانی...')

    try {
      const response = await fetch('/api/staff/providers', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Failed to load providers (${response.status})`)
      }

      const data = (await response.json()) as { providers?: StaffProvider[] }
      const nextProviders = Array.isArray(data.providers) ? data.providers : []
      setProviders(nextProviders)
      return nextProviders
    } catch (error) {
      console.error('Failed to refresh providers from staff dashboard', error)
      showToast({ description: 'به‌روزرسانی بازه‌های زمانی ممکن نشد.', variant: 'error' })
      throw error
    } finally {
      setActivity('staff-providers-refresh', false)
    }
  }, [setActivity, setProviders, showToast])

  const handleRefresh = useCallback(() => {
    setActivity('staff-refresh', true, 'در حال به‌روزرسانی نوبت‌ها...')
    startRefreshTransition(async () => {
      try {
        setErrorMessage(null)
        const query = new URLSearchParams({ scope: mode })
        const response = await fetch(`/api/staff/appointments?${query.toString()}`, {
          cache: 'no-store',
        })
        if (!response.ok) {
          throw new Error(`Failed to refresh appointments (${response.status})`)
        }
        const result = (await response.json()) as { appointments?: unknown }
        const mapped = Array.isArray(result.appointments)
          ? (result.appointments as unknown[]).map((appointment) => mapAppointmentFromApi(appointment))
          : []
        setAppointments(sortAppointmentsByStart(mapped))
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
  }, [mode, setActivity, showToast])

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
        const result = (await response.json()) as { appointment?: unknown }
        const normalized = mapAppointmentFromApi(result.appointment)
        upsertAppointment(normalized)
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
    [setActivity, showToast, upsertAppointment],
  )

  const handleCreateSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setCreateError(null)

      if (isCreating) {
        return
      }

      const clientId = createForm.clientId.trim()
      const serviceId = createForm.serviceId.trim()
      const providerId = createForm.providerId.trim()
      const startISO = toISOStringOrNull(createForm.start)
      const endISO = toISOStringOrNull(createForm.end)

      if (!clientId || !serviceId || !providerId) {
        const message = 'لطفاً تمام فیلدها را تکمیل کنید.'
        setCreateError(message)
        showToast({ description: message, variant: 'error' })
        return
      }

      if (!startISO || !endISO) {
        const message = 'زمان نوبت معتبر نیست.'
        setCreateError(message)
        showToast({ description: message, variant: 'error' })
        return
      }

      if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
        const message = 'بازه زمانی معتبر نیست.'
        setCreateError(message)
        showToast({ description: message, variant: 'error' })
        return
      }

      const timeZone = createForm.timeZone.trim() || providerLookup.get(providerId)?.timeZone || 'UTC'

      setIsCreating(true)
      setActivity('staff-create', true, 'در حال ایجاد نوبت...')

      try {
        const response = await fetch('/api/staff/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client: clientId,
            service: serviceId,
            provider: providerId,
            schedule: {
              start: startISO,
              end: endISO,
              timeZone: timeZone.trim() || 'UTC',
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to create appointment (${response.status})`)
        }

        const result = (await response.json()) as { appointment?: unknown }

        if (!result.appointment) {
          throw new Error('Missing appointment in response')
        }

        const normalized = mapAppointmentFromApi(result.appointment)
        upsertAppointment(normalized)
        setFailedId(null)
        setIsCreateModalOpen(false)
        setCreateForm({ clientId: '', serviceId: '', providerId: '', start: '', end: '', timeZone: '' })
        showToast({ description: 'نوبت با موفقیت ثبت شد.', variant: 'success' })
      } catch (error) {
        console.error(error)
        setCreateError('ایجاد نوبت ممکن نشد.')
        showToast({ description: 'ایجاد نوبت ممکن نشد.', variant: 'error' })
      } finally {
        setIsCreating(false)
        setActivity('staff-create', false)
      }
    },
    [createForm, isCreating, providerLookup, setActivity, showToast, upsertAppointment],
  )

  const handleScheduleEditOpen = useCallback((appointment: StaffAppointment) => {
    setEditingScheduleId(appointment.id)
    setScheduleForm({
      start: toInputValue(appointment.start),
      end: toInputValue(appointment.end),
    })
    setScheduleError(null)
  }, [])

  const handleScheduleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!editingScheduleId) {
        return
      }

      setScheduleError(null)

      const startISO = toISOStringOrNull(scheduleForm.start)
      const endISO = toISOStringOrNull(scheduleForm.end)

      if (!startISO || !endISO) {
        const message = 'زمان نوبت معتبر نیست.'
        setScheduleError(message)
        showToast({ description: message, variant: 'error' })
        return
      }

      if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
        const message = 'بازه زمانی معتبر نیست.'
        setScheduleError(message)
        showToast({ description: message, variant: 'error' })
        return
      }

      const appointment = appointments.find((item) => item.id === editingScheduleId)
      const timeZone = appointment?.timeZone ?? 'UTC'

      setIsSavingSchedule(true)
      setActivity(`staff-schedule-${editingScheduleId}`, true, 'در حال به‌روزرسانی زمان نوبت...')

      try {
        const response = await fetch(`/api/staff/appointments/${editingScheduleId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            schedule: {
              start: startISO,
              end: endISO,
              timeZone,
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to update appointment (${response.status})`)
        }

        const result = (await response.json()) as { appointment?: unknown }

        if (!result.appointment) {
          throw new Error('Missing appointment in response')
        }

        const normalized = mapAppointmentFromApi(result.appointment)
        upsertAppointment(normalized)
        setFailedId(null)
        setEditingScheduleId(null)
        showToast({ description: 'زمان نوبت با موفقیت به‌روزرسانی شد.', variant: 'success' })
      } catch (error) {
        console.error(error)
        setScheduleError('ویرایش زمان نوبت ممکن نشد.')
        setFailedId(editingScheduleId)
        showToast({ description: 'ویرایش زمان نوبت ممکن نشد.', variant: 'error' })
      } finally {
        setIsSavingSchedule(false)
        setActivity(`staff-schedule-${editingScheduleId}`, false)
      }
    },
    [appointments, editingScheduleId, scheduleForm, setActivity, showToast, upsertAppointment],
  )

  const handleScheduleCancel = useCallback(() => {
    setEditingScheduleId(null)
    setScheduleError(null)
  }, [])

  const handleLogout = useCallback(async () => {
    await fetch('/api/staff/logout', {
      method: 'POST',
    })
    window.location.href = '/staff/login'
  }, [])

  const copy = dashboardCopy[mode]
  const providerCopy = providerCardCopy[mode]

  return (
    <motion.div
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="mx-auto flex w-full max-w-6xl flex-col gap-8"
    >
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">رزرو نوبت جدید</h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setCreateError(null)
                }}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
                aria-label="بستن فرم ایجاد نوبت"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form className="mt-4 flex flex-col gap-4" onSubmit={handleCreateSubmit}>
              <Input
                label="شناسه بیمار"
                value={createForm.clientId}
                onChange={(event) =>
                  setCreateForm((previous) => ({ ...previous, clientId: event.target.value }))
                }
                autoComplete="off"
              />
              <Input
                label="شناسه خدمت"
                value={createForm.serviceId}
                onChange={(event) =>
                  setCreateForm((previous) => ({ ...previous, serviceId: event.target.value }))
                }
                autoComplete="off"
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="create-provider-select" className="text-right text-sm font-medium text-foreground">
                  ارائه‌دهنده
                </label>
                <select
                  id="create-provider-select"
                  value={createForm.providerId}
                  onChange={(event) => {
                    const nextProvider = event.target.value
                    const provider = providerLookup.get(nextProvider)
                    setCreateForm((previous) => ({
                      ...previous,
                      providerId: nextProvider,
                      timeZone: provider?.timeZone ?? previous.timeZone,
                    }))
                  }}
                  className="glass-panel rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <option value="">یک ارائه‌دهنده را انتخاب کنید</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="زمان شروع"
                type="datetime-local"
                value={createForm.start}
                onChange={(event) =>
                  setCreateForm((previous) => ({ ...previous, start: event.target.value }))
                }
              />
              <Input
                label="زمان پایان"
                type="datetime-local"
                value={createForm.end}
                onChange={(event) =>
                  setCreateForm((previous) => ({ ...previous, end: event.target.value }))
                }
              />
              <Input
                label="منطقه زمانی"
                value={createForm.timeZone}
                onChange={(event) =>
                  setCreateForm((previous) => ({ ...previous, timeZone: event.target.value }))
                }
                placeholder="مثال: Asia/Tehran"
              />
              {createError && (
                <p className="text-right text-xs text-red-500">{createError}</p>
              )}
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setCreateError(null)
                  }}
                  disabled={isCreating}
                  className="gap-2"
                >
                  انصراف
                </Button>
                <Button type="submit" size="sm" isLoading={isCreating} className="gap-2">
                  <Plus className="h-4 w-4" />
                  ایجاد نوبت
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.1, duration: prefersReducedMotion ? 0 : 0.45 }}
      >
        <Card
          variant="default"
          padding="lg"
          className="flex flex-col gap-4 text-right sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">پنل مدیریت</span>
            <motion.h1
              initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="text-3xl font-bold text-foreground sm:text-4xl"
            >
              {copy.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {copy.description}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.35, duration: prefersReducedMotion ? 0 : 0.5 }}
            className="flex flex-col items-end gap-3 text-sm text-muted-foreground"
          >
            <div>
              <span className="font-medium text-foreground">{currentUser.email}</span>
              <span className="mx-2 text-muted-foreground/70">•</span>
              <span>{currentUser.roles.map(getRoleLabel).join('، ')}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </motion.div>
        </Card>
      </motion.div>

      {showUserManagement && (
        <motion.div
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <StaffUserCreationCard currentUser={currentUser} />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
      >
        <Card variant="default" padding="lg" className="flex flex-col gap-6 text-right">
          <div className="flex flex-col gap-1 text-right">
            <div className="flex w-full items-center justify-between">
              <GlassIcon icon={Calendar} size="sm" label="مدیریت نوبت‌ها" />
              <h2 className="text-lg font-semibold text-foreground">مدیریت نوبت‌ها</h2>
            </div>
            <p className="text-xs text-muted-foreground">فهرست نوبت‌های رزرو شده در بازه پیش‌رو.</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                  placeholder={searchPlaceholderByMode[mode]}
                  className="glass-panel w-full rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 sm:w-64"
                />
              </div>
            </div>

              <div className="flex items-center justify-end gap-2">
                {canCreateAppointments && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsCreateModalOpen(true)
                      setCreateError(null)
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    رزرو نوبت جدید
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  به‌روزرسانی
                </Button>
              </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="space-y-6">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-white/10 text-right text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 lg:px-4">زمان نوبت</th>
                    <th className="px-3 py-3 lg:px-4">بیمار</th>
                    {showProviderColumn && <th className="px-3 py-3 lg:px-4">ارائه‌دهنده</th>}
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
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className="block">{formatDateTime(appointment.start, appointment.timeZone)}</span>
                            <span className="block text-[11px] text-muted-foreground">
                              تا {formatDateTime(appointment.end, appointment.timeZone).split('—')[1]?.trim() ?? ''}
                            </span>
                          </div>
                          {editingScheduleId === appointment.id ? (
                            <form className="flex flex-col gap-2" onSubmit={handleScheduleSubmit}>
                              <Input
                                label="زمان شروع جدید"
                                type="datetime-local"
                                value={scheduleForm.start}
                                onChange={(event) =>
                                  setScheduleForm((previous) => ({ ...previous, start: event.target.value }))
                                }
                                disabled={isSavingSchedule}
                              />
                              <Input
                                label="زمان پایان جدید"
                                type="datetime-local"
                                value={scheduleForm.end}
                                onChange={(event) =>
                                  setScheduleForm((previous) => ({ ...previous, end: event.target.value }))
                                }
                                disabled={isSavingSchedule}
                              />
                              {scheduleError && (
                                <p className="text-right text-[11px] text-red-500">{scheduleError}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <Button type="submit" size="sm" isLoading={isSavingSchedule} className="gap-2">
                                  ذخیره زمان
                                </Button>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={handleScheduleCancel}
                                  disabled={isSavingSchedule}
                                  className="gap-2"
                                >
                                  انصراف
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleScheduleEditOpen(appointment)}
                              className="self-end text-[11px] font-medium text-accent transition-colors hover:text-accent/80"
                            >
                              <span className="inline-flex items-center gap-1">
                                <Edit3 className="h-3.5 w-3.5" />
                                ویرایش زمان
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs lg:px-4">{appointment.clientEmail}</td>
                      {showProviderColumn && <td className="px-3 py-3 text-xs lg:px-4">{appointment.providerName}</td>}
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
                      <td colSpan={totalColumns} className="px-4 py-6 text-center text-sm text-muted-foreground">
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
                      failedId === appointment.id
                        ? 'border border-red-300/60 bg-red-50 dark:border-red-400/60 dark:bg-red-500/20'
                        : 'border border-white/10 bg-white/10 dark:border-white/10'
                    }`}
                  >
                    <div className="flex flex-col gap-3 text-sm text-foreground">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground">زمان نوبت</span>
                        <span className="font-medium">{formatDateTime(appointment.start, appointment.timeZone)}</span>
                        <span className="text-[11px] text-muted-foreground">
                          تا {formatDateTime(appointment.end, appointment.timeZone).split('—')[1]?.trim() ?? ''}
                        </span>
                      </div>

                      {editingScheduleId === appointment.id ? (
                        <form className="flex flex-col gap-2" onSubmit={handleScheduleSubmit}>
                          <Input
                            label="زمان شروع جدید"
                            type="datetime-local"
                            value={scheduleForm.start}
                            onChange={(event) =>
                              setScheduleForm((previous) => ({ ...previous, start: event.target.value }))
                            }
                            disabled={isSavingSchedule}
                          />
                          <Input
                            label="زمان پایان جدید"
                            type="datetime-local"
                            value={scheduleForm.end}
                            onChange={(event) =>
                              setScheduleForm((previous) => ({ ...previous, end: event.target.value }))
                            }
                            disabled={isSavingSchedule}
                          />
                          {scheduleError && (
                            <p className="text-right text-[11px] text-red-500">{scheduleError}</p>
                          )}
                          <div className="flex items-center justify-end gap-2">
                            <Button type="submit" size="sm" isLoading={isSavingSchedule} className="gap-2">
                              ذخیره زمان
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={handleScheduleCancel}
                              disabled={isSavingSchedule}
                              className="gap-2"
                            >
                              انصراف
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleScheduleEditOpen(appointment)}
                          className="self-end text-[11px] font-medium text-accent transition-colors hover:text-accent/80"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Edit3 className="h-3.5 w-3.5" />
                            ویرایش زمان
                          </span>
                        </button>
                      )}

                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground">بیمار</span>
                        <span>{appointment.clientEmail}</span>
                      </div>

                      {showProviderColumn && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-muted-foreground">ارائه‌دهنده</span>
                          <span>{appointment.providerName}</span>
                        </div>
                      )}

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

      <motion.div
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.35, duration: prefersReducedMotion ? 0 : 0.5 }}
      >
        <Card variant="default" padding="lg" className="flex flex-col gap-6 text-right">
          <div className="flex flex-col gap-1 text-right">
            <div className="flex w-full items-center justify-between">
              <GlassIcon icon={Users} size="sm" label={providerCopy.iconLabel} />
              <h2 className="text-lg font-semibold text-foreground">{providerCopy.title}</h2>
            </div>
            <p className="text-xs text-muted-foreground">{providerCopy.description}</p>
          </div>

          <ProviderAvailabilityEditor
            providers={providers}
            currentUser={currentUser}
            onRefreshProviders={refreshProviders}
          />
        </Card>
      </motion.div>
    </motion.div>
  )
}

const RoleAwareDashboard = (props: StaffDashboardProps) => (
  <GlobalLoadingOverlayProvider>
    <StaffDashboardContent {...props} />
  </GlobalLoadingOverlayProvider>
)

export const DoctorDashboard = (props: SharedDashboardProps) => (
  <RoleAwareDashboard {...props} mode="doctor" />
)

export const ReceptionistDashboard = (props: SharedDashboardProps) => (
  <RoleAwareDashboard {...props} mode="receptionist" />
)

export type { SharedDashboardProps as StaffDashboardInputProps }
