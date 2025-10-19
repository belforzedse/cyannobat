import React from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import StaffDashboard from './StaffDashboard'
import { ToastProvider } from '@/components/ui/ToastProvider'
import type { StaffAppointment, StaffProvider, StaffUser } from '@/features/staff/types'

const baseAppointment: StaffAppointment = {
  id: 'appointment-1',
  status: 'pending',
  start: new Date('2024-01-01T09:00:00Z').toISOString(),
  end: new Date('2024-01-01T09:30:00Z').toISOString(),
  timeZone: 'UTC',
  providerName: 'Dr. Example',
  serviceTitle: 'General Checkup',
  clientEmail: 'patient@example.com',
  createdAt: new Date('2023-12-31T12:00:00Z').toISOString(),
  reference: 'ABC123',
}

const providers: StaffProvider[] = [
  {
    id: 'provider-1',
    displayName: 'Dr. Example',
    timeZone: 'UTC',
    availability: [],
  },
]

const currentUser: StaffUser = {
  email: 'staff@example.com',
  roles: ['staff'],
}

const renderDashboard = (appointments: StaffAppointment[]) => {
  return render(
    <ToastProvider>
      <StaffDashboard initialAppointments={appointments} initialProviders={providers} currentUser={currentUser} />
    </ToastProvider>,
  )
}

const fetchMock = vi.fn()
let consoleErrorSpy: ReturnType<typeof vi.spyOn> | null = null

describe('StaffDashboard interactions', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    globalThis.fetch = fetchMock as unknown as typeof fetch
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy?.mockRestore()
  })

  it('shows spinner and success toast when updating a status succeeds', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        appointment: {
          ...baseAppointment,
          status: 'confirmed',
        },
      }),
    } as Response)

    renderDashboard([baseAppointment])

    const row = screen.getByText('patient@example.com').closest('tr')
    expect(row).not.toBeNull()
    const statusSelect = within(row as HTMLTableRowElement).getByRole('combobox')

    fireEvent.change(statusSelect, { target: { value: 'confirmed' } })

    expect(screen.getByTestId('status-spinner-appointment-1')).toBeInTheDocument()

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/staff/appointments/appointment-1', expect.anything()))

    await screen.findByText('وضعیت نوبت با موفقیت ذخیره شد.')

    await waitFor(() => expect(screen.queryByTestId('status-spinner-appointment-1')).not.toBeInTheDocument())
    expect((row as HTMLTableRowElement).className).not.toContain('bg-red-100')
  })

  it('shows error toast, highlights the row, and keeps the banner on status failure', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    renderDashboard([baseAppointment])

    const row = screen.getByText('patient@example.com').closest('tr')
    const statusSelect = within(row as HTMLTableRowElement).getByRole('combobox')

    fireEvent.change(statusSelect, { target: { value: 'confirmed' } })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const messages = await screen.findAllByText('ذخیره وضعیت جدید ممکن نشد.')
    expect(messages.length).toBeGreaterThanOrEqual(2)

    await waitFor(() => expect((row as HTMLTableRowElement).className).toContain('bg-red-100'))
    await waitFor(() => expect(screen.queryByTestId('status-spinner-appointment-1')).not.toBeInTheDocument())
  })

  it('shows success toast when refreshing succeeds', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        appointments: [
          {
            ...baseAppointment,
            status: 'confirmed',
          },
        ],
      }),
    } as Response)

    renderDashboard([baseAppointment])

    fireEvent.click(screen.getByRole('button', { name: 'به‌روزرسانی' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/staff/appointments', expect.anything()))

    await screen.findByText('فهرست نوبت‌ها به‌روزرسانی شد.')
  })

  it('shows error toast and banner when refreshing fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    renderDashboard([baseAppointment])

    fireEvent.click(screen.getByRole('button', { name: 'به‌روزرسانی' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const errors = await screen.findAllByText('به‌روزرسانی فهرست نوبت‌ها با مشکل مواجه شد.')
    expect(errors.length).toBeGreaterThan(0)
  })
})

