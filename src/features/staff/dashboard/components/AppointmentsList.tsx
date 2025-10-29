'use client'

import { Loader2, Edit3 } from 'lucide-react'

import { glassPanelStyles } from '@/components/ui/glass'
import { cn } from '@/lib/utils'
import type { StaffAppointment } from '@/features/staff/types'

import type { StatusOption } from '../constants'

export type AppointmentsListProps = {
  appointments: StaffAppointment[]
  showProviderColumn: boolean
  statusOptions: StatusOption[]
  onStatusChange: (id: string, status: StaffAppointment['status']) => void
  updatingId: string | null
  failedId: string | null
  editingScheduleId: string | null
  onEditSchedule: (appointment: StaffAppointment) => void
  renderScheduleEditor: (appointment: StaffAppointment) => React.ReactNode
  formatDateTime: (iso: string, timeZone: string) => string
}

export const AppointmentsList = ({
  appointments,
  showProviderColumn,
  statusOptions,
  onStatusChange,
  updatingId,
  failedId,
  editingScheduleId,
  onEditSchedule,
  renderScheduleEditor,
  formatDateTime,
}: AppointmentsListProps) => (
  <div className="flex flex-col gap-3 md:hidden">
    {appointments.length > 0 ? (
      appointments.map((appointment) => {
        const isEditing = editingScheduleId === appointment.id
        const isUpdating = updatingId === appointment.id
        const hasFailed = failedId === appointment.id

        return (
          <div
            key={appointment.id}
            className={cn(
              glassPanelStyles(),
              'rounded-2xl border p-4 text-right shadow-sm transition-colors',
              hasFailed
                ? 'border-red-300/60 bg-red-50 dark:border-red-400/60 dark:bg-red-500/20'
                : 'border-white/10 bg-white/10 dark:border-white/10',
            )}
          >
            <div className="flex flex-col gap-3 text-sm text-foreground">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground">زمان نوبت</span>
                <span className="font-medium">{formatDateTime(appointment.start, appointment.timeZone)}</span>
                <span className="text-[11px] text-muted-foreground">
                  تا {formatDateTime(appointment.end, appointment.timeZone).split('—')[1]?.trim() ?? ''}
                </span>
              </div>

              {isEditing ? (
                renderScheduleEditor(appointment)
              ) : (
                <button
                  type="button"
                  onClick={() => onEditSchedule(appointment)}
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
                    onChange={(event) => onStatusChange(appointment.id, event.target.value as StaffAppointment['status'])}
                    disabled={isUpdating}
                    className={cn(
                      glassPanelStyles(),
                      'flex-1 rounded-full px-3 py-2 text-xs font-semibold text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-accent/40',
                    )}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {isUpdating && (
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
        )
      })
    ) : (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/10 p-6 text-center text-sm text-muted-foreground dark:border-white/10">
        نوبتی با این شرایط یافت نشد.
      </div>
    )}
  </div>
)
