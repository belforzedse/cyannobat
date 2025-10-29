'use client'

import { Loader2, Edit3 } from 'lucide-react'

import { glassPanelStyles } from '@/components/ui/glass'
import { cn } from '@/lib/utils'
import type { StaffAppointment } from '@/features/staff/types'

import type { StatusOption } from '../constants'

export type AppointmentsTableProps = {
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
  totalColumns: number
}

export const AppointmentsTable = ({
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
  totalColumns,
}: AppointmentsTableProps) => (
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
        {appointments.map((appointment) => {
          const isEditing = editingScheduleId === appointment.id
          const isUpdating = updatingId === appointment.id
          const hasFailed = failedId === appointment.id

          return (
            <tr
              key={appointment.id}
              className={cn(
                'transition-colors hover:bg-white/5 focus-within:bg-white/10',
                hasFailed && 'bg-red-100 dark:bg-red-500/20',
              )}
            >
              <td className="px-3 py-3 text-xs font-medium lg:px-4">
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="block">{formatDateTime(appointment.start, appointment.timeZone)}</span>
                    <span className="block text-[11px] text-muted-foreground">
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
                    onChange={(event) => onStatusChange(appointment.id, event.target.value as StaffAppointment['status'])}
                    disabled={isUpdating}
                    className={cn(
                      glassPanelStyles(),
                      'rounded-full px-3 py-1 text-xs font-semibold text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-accent/40',
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
                      className="h-4 w-4 animate-spin text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </td>
            </tr>
          )
        })}
        {appointments.length === 0 && (
          <tr>
            <td colSpan={totalColumns} className="px-4 py-6 text-center text-sm text-muted-foreground">
              نوبتی با این شرایط یافت نشد.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)
