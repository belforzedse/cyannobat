import React from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReceptionistDashboard } from './StaffDashboard'
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

const defaultStaffUser: StaffUser = {
  email: 'staff@example.com',
  roles: ['receptionist'],
}

const renderDashboard = (appointments: StaffAppointment[], user: StaffUser = defaultStaffUser) => {
  return render(
    <ToastProvider>
      <ReceptionistDashboard
        initialAppointments={appointments}
        initialProviders={providers}
        currentUser={user}
      />
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

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
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

    const row = screen.getAllByRole('cell', { name: 'patient@example.com' })[0]?.closest('tr')
    expect(row).not.toBeNull()
    const statusSelect = within(row as HTMLTableRowElement).getByRole('combobox')

    fireEvent.change(statusSelect, { target: { value: 'confirmed' } })

    expect(screen.getAllByTestId('status-spinner-appointment-1')[0]).toBeInTheDocument()

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/staff/appointments/appointment-1', expect.anything()))

    await screen.findByText('وضعیت نوبت با موفقیت ذخیره شد.')

    await waitFor(() => expect(screen.queryAllByTestId('status-spinner-appointment-1')).toHaveLength(0))
    expect((row as HTMLTableRowElement).className).not.toContain('bg-red-100')
  })

  it('shows error toast, highlights the row, and keeps the banner on status failure', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    renderDashboard([baseAppointment])

    const row = screen.getAllByRole('cell', { name: 'patient@example.com' })[0]?.closest('tr')
    const statusSelect = within(row as HTMLTableRowElement).getByRole('combobox')

    fireEvent.change(statusSelect, { target: { value: 'confirmed' } })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const messages = await screen.findAllByText('ذخیره وضعیت جدید ممکن نشد.')
    expect(messages.length).toBeGreaterThanOrEqual(2)

    await waitFor(() => expect((row as HTMLTableRowElement).className).toContain('bg-red-100'))
    await waitFor(() => expect(screen.queryAllByTestId('status-spinner-appointment-1')).toHaveLength(0))
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

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/api/staff/appointments?scope=receptionist', expect.anything()),
    )

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

  it('submits user creation request when admin completes the form', async () => {
    const adminUser: StaffUser = {
      email: 'admin@example.com',
      roles: ['admin'],
    }

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          email: 'newpatient@example.com',
          phone: null,
          nationalId: '0499370899',
          roles: ['patient'],
        },
      }),
    } as Response)

    renderDashboard([baseAppointment], adminUser)

    fireEvent.change(screen.getByLabelText(/ایمیل/), { target: { value: 'newpatient@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('09120000000'), { target: { value: '09123456789' } })
    fireEvent.change(screen.getByLabelText('کد ملی'), { target: { value: '۰۴۹۹۳۷۰۸۹۹' } })
    fireEvent.change(screen.getByLabelText('رمز عبور موقت'), { target: { value: 'examplepass' } })

    const roleSelect = screen.getByLabelText('نقش کاربر')
    fireEvent.change(roleSelect, { target: { value: 'patient' } })

    fireEvent.click(screen.getByRole('button', { name: 'ایجاد کاربر' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const fetchArgs = fetchMock.mock.calls[0] as unknown[]
    expect(fetchArgs[0]).toBe('/api/staff/users')
    expect((fetchArgs[1] as RequestInit)?.method).toBe('POST')

    const body = JSON.parse(((fetchArgs[1] as RequestInit)?.body as string) ?? '{}')
    expect(body).toMatchObject({
      email: 'newpatient@example.com',
      phone: '09123456789',
      nationalId: '0499370899',
      roles: ['patient'],
    })

    await screen.findByText('کاربر بیمار برای newpatient@example.com با موفقیت ایجاد شد.')
  })

  it('allows a receptionist to create a new appointment', async () => {
    const receptionist: StaffUser = {
      email: 'reception@example.com',
      roles: ['receptionist'],
    }

    const createdAppointment: StaffAppointment = {
      ...baseAppointment,
      id: 'appointment-2',
      clientEmail: 'newpatient@example.com',
    }

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        appointment: createdAppointment,
      }),
    } as Response)

    renderDashboard([baseAppointment], receptionist)

    fireEvent.click(screen.getByRole('button', { name: 'رزرو نوبت جدید' }))

    fireEvent.change(screen.getByLabelText('شناسه بیمار'), { target: { value: 'user-1' } })
    fireEvent.change(screen.getByLabelText('شناسه خدمت'), { target: { value: 'service-1' } })
    fireEvent.change(screen.getByLabelText('ارائه‌دهنده'), { target: { value: 'provider-1' } })
    fireEvent.change(screen.getByLabelText('زمان شروع'), { target: { value: '2024-02-01T09:00' } })
    fireEvent.change(screen.getByLabelText('زمان پایان'), { target: { value: '2024-02-01T09:30' } })
    fireEvent.change(screen.getByLabelText('منطقه زمانی'), { target: { value: 'UTC' } })

    fireEvent.click(screen.getByRole('button', { name: 'ایجاد نوبت' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const fetchArgs = fetchMock.mock.calls[0] as unknown[]
    expect(fetchArgs[0]).toBe('/api/staff/appointments')
    const requestInit = fetchArgs[1] as RequestInit
    expect(requestInit?.method).toBe('POST')
    const body = JSON.parse((requestInit?.body as string) ?? '{}')
    expect(body).toMatchObject({
      client: 'user-1',
      service: 'service-1',
      provider: 'provider-1',
      schedule: {
        timeZone: 'UTC',
      },
    })
    expect(typeof body.schedule.start).toBe('string')
    expect(typeof body.schedule.end).toBe('string')

    await screen.findByText('نوبت با موفقیت ثبت شد.')
    const newEmailCells = screen.getAllByRole('cell', { name: 'newpatient@example.com' })
    expect(newEmailCells.length).toBeGreaterThan(0)
  })

  it('shows validation errors when the create appointment form is invalid', async () => {
    const receptionist: StaffUser = {
      email: 'reception@example.com',
      roles: ['receptionist'],
    }

    renderDashboard([baseAppointment], receptionist)

    fireEvent.click(screen.getByRole('button', { name: 'رزرو نوبت جدید' }))

    fireEvent.change(screen.getByLabelText('شناسه بیمار'), { target: { value: 'user-1' } })
    fireEvent.change(screen.getByLabelText('شناسه خدمت'), { target: { value: 'service-1' } })
    fireEvent.change(screen.getByLabelText('ارائه‌دهنده'), { target: { value: 'provider-1' } })
    fireEvent.change(screen.getByLabelText('زمان شروع'), { target: { value: '2024-02-01T10:00' } })
    fireEvent.change(screen.getByLabelText('زمان پایان'), { target: { value: '2024-02-01T09:00' } })
    fireEvent.change(screen.getByLabelText('منطقه زمانی'), { target: { value: 'UTC' } })

    fireEvent.click(screen.getByRole('button', { name: 'ایجاد نوبت' }))

    expect(fetchMock).not.toHaveBeenCalled()
    const validationMessages = await screen.findAllByText('بازه زمانی معتبر نیست.')
    expect(validationMessages.length).toBeGreaterThan(0)
  })

  it('updates the schedule when saving succeeds', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        appointment: {
          ...baseAppointment,
          start: new Date('2024-02-01T09:00:00Z').toISOString(),
          end: new Date('2024-02-01T09:30:00Z').toISOString(),
        },
      }),
    } as Response)

    renderDashboard([baseAppointment])

    const row = screen.getAllByRole('cell', { name: 'patient@example.com' })[0]?.closest('tr') as HTMLTableRowElement
    fireEvent.click(within(row).getByRole('button', { name: 'ویرایش زمان' }))

    const startInput = within(row).getByLabelText('زمان شروع جدید') as HTMLInputElement
    const endInput = within(row).getByLabelText('زمان پایان جدید') as HTMLInputElement

    fireEvent.change(startInput, { target: { value: '2024-02-01T09:00' } })
    fireEvent.change(endInput, { target: { value: '2024-02-01T09:30' } })

    fireEvent.click(within(row).getByRole('button', { name: 'ذخیره زمان' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const fetchArgs = fetchMock.mock.calls[0] as unknown[]
    expect(fetchArgs[0]).toBe('/api/staff/appointments/appointment-1')
    const requestInit = fetchArgs[1] as RequestInit
    expect(requestInit?.method).toBe('PATCH')
    const body = JSON.parse((requestInit?.body as string) ?? '{}')
    expect(body.schedule).toMatchObject({
      timeZone: 'UTC',
    })
    expect(typeof body.schedule.start).toBe('string')
    expect(typeof body.schedule.end).toBe('string')

    await screen.findByText('زمان نوبت با موفقیت به‌روزرسانی شد.')
    await waitFor(() => expect(within(row).queryByLabelText('زمان شروع جدید')).not.toBeInTheDocument())
  })
})

