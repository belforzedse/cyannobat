'use client'

import { useEffect, useState } from 'react'

import { Button, Input } from '@/components/ui'
import type { StaffAppointment } from '@/features/staff/types'

import { toInputValue, toISOStringOrNull } from '../utils'
import type { UpdateSchedulePayload, UpdateScheduleResult } from '../hooks'

export type ScheduleEditorProps = {
  appointment: StaffAppointment
  isSaving: boolean
  onCancel: () => void
  onSubmit: (appointmentId: string, payload: UpdateSchedulePayload) => Promise<UpdateScheduleResult>
  onSuccess: () => void
}

export const ScheduleEditor = ({
  appointment,
  isSaving,
  onCancel,
  onSubmit,
  onSuccess,
}: ScheduleEditorProps) => {
  const [startValue, setStartValue] = useState(() => toInputValue(appointment.start))
  const [endValue, setEndValue] = useState(() => toInputValue(appointment.end))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStartValue(toInputValue(appointment.start))
    setEndValue(toInputValue(appointment.end))
    setError(null)
  }, [appointment.id, appointment.start, appointment.end])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const startISO = toISOStringOrNull(startValue)
    const endISO = toISOStringOrNull(endValue)

    if (!startISO || !endISO) {
      setError('زمان نوبت معتبر نیست.')
      return
    }

    if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
      setError('بازه زمانی معتبر نیست.')
      return
    }

    const result = await onSubmit(appointment.id, {
      start: startISO,
      end: endISO,
      timeZone: appointment.timeZone || 'UTC',
    })

    if (result.success) {
      setError(null)
      onSuccess()
    } else {
      setError(result.error)
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <Input
        label="زمان شروع جدید"
        type="datetime-local"
        value={startValue}
        onChange={(event) => setStartValue(event.target.value)}
        disabled={isSaving}
      />
      <Input
        label="زمان پایان جدید"
        type="datetime-local"
        value={endValue}
        onChange={(event) => setEndValue(event.target.value)}
        disabled={isSaving}
      />
      {error && <p className="text-right text-[11px] text-red-500">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" isLoading={isSaving} className="gap-2">
          ذخیره زمان
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={isSaving} className="gap-2">
          انصراف
        </Button>
      </div>
    </form>
  )
}
