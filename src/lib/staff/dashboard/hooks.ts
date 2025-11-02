import { useCallback, useMemo, useState, useTransition } from 'react';

import { useToast } from '@/components/ui';
import { useGlobalLoadingOverlay } from '@/components/GlobalLoadingOverlayProvider';
import type { StaffAppointment, StaffProvider } from '@/lib/staff/types';

import type { DashboardMode } from './types';
import { mapAppointmentFromApi, sortAppointmentsByStart } from './utils';

type CreateAppointmentPayload = {
  clientId: string;
  serviceId: string;
  providerId: string;
  start: string;
  end: string;
  timeZone: string;
};

type UpdateSchedulePayload = {
  start: string;
  end: string;
  timeZone: string;
};

type UseAppointmentsStateArgs = {
  initialAppointments: StaffAppointment[];
  initialProviders: StaffProvider[];
  mode: DashboardMode;
};

type CreateAppointmentResult =
  | { success: true; appointment: StaffAppointment }
  | { success: false; error: string };

type UpdateScheduleResult =
  | { success: true; appointment: StaffAppointment }
  | { success: false; error: string };

export const useAppointmentsState = ({
  initialAppointments,
  initialProviders,
  mode,
}: UseAppointmentsStateArgs) => {
  const [appointments, setAppointments] = useState(() =>
    sortAppointmentsByStart(initialAppointments),
  );
  const [providers, setProviders] = useState<StaffProvider[]>(initialProviders);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isRefreshing, startRefreshTransition] = useTransition();

  const { showToast } = useToast();
  const { setActivity } = useGlobalLoadingOverlay();

  const upsertAppointment = useCallback((appointment: StaffAppointment) => {
    setAppointments((current) => {
      const filtered = current.filter((item) => item.id !== appointment.id);
      return sortAppointmentsByStart([...filtered, appointment]);
    });
  }, []);

  const refreshProviders = useCallback(async (): Promise<StaffProvider[]> => {
    setActivity('staff-providers-refresh', true, 'در حال به‌روزرسانی بازه‌های زمانی...');

    try {
      const response = await fetch('/api/staff/providers', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to load providers (${response.status})`);
      }

      const data = (await response.json()) as { providers?: StaffProvider[] };
      const nextProviders = Array.isArray(data.providers) ? data.providers : [];
      setProviders(nextProviders);
      return nextProviders;
    } catch (error) {
      console.error('Failed to refresh providers from staff dashboard', error);
      showToast({ description: 'به‌روزرسانی بازه‌های زمانی ممکن نشد.', variant: 'error' });
      throw error;
    } finally {
      setActivity('staff-providers-refresh', false);
    }
  }, [setActivity, showToast]);

  const refreshAppointments = useCallback(() => {
    setActivity('staff-refresh', true, 'در حال به‌روزرسانی نوبت‌ها...');
    startRefreshTransition(async () => {
      try {
        setErrorMessage(null);
        const query = new URLSearchParams({ scope: mode });
        const response = await fetch(`/api/staff/appointments?${query.toString()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to refresh appointments (${response.status})`);
        }

        const result = (await response.json()) as { appointments?: unknown };
        const mapped = Array.isArray(result.appointments)
          ? (result.appointments as unknown[]).map((appointment) =>
              mapAppointmentFromApi(appointment),
            )
          : [];

        setAppointments(sortAppointmentsByStart(mapped));
        setFailedId(null);
        showToast({ description: 'فهرست نوبت‌ها به‌روزرسانی شد.', variant: 'success' });
      } catch (error) {
        console.error(error);
        setErrorMessage('به‌روزرسانی فهرست نوبت‌ها با مشکل مواجه شد.');
        showToast({ description: 'به‌روزرسانی فهرست نوبت‌ها با مشکل مواجه شد.', variant: 'error' });
      } finally {
        setActivity('staff-refresh', false);
      }
    });
  }, [mode, setActivity, showToast]);

  const updateAppointmentStatus = useCallback(
    async (appointmentId: string, status: StaffAppointment['status']) => {
      setUpdatingId(appointmentId);
      setErrorMessage(null);
      setActivity(`staff-status-${appointmentId}`, true, 'در حال ذخیره تغییر وضعیت...');
      try {
        const response = await fetch(`/api/staff/appointments/${appointmentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          throw new Error(`Failed to update appointment (${response.status})`);
        }
        const result = (await response.json()) as { appointment?: unknown };
        const normalized = mapAppointmentFromApi(result.appointment);
        upsertAppointment(normalized);
        setFailedId(null);
        showToast({ description: 'وضعیت نوبت با موفقیت ذخیره شد.', variant: 'success' });
      } catch (error) {
        console.error(error);
        setErrorMessage('ذخیره وضعیت جدید ممکن نشد.');
        setFailedId(appointmentId);
        showToast({ description: 'ذخیره وضعیت جدید ممکن نشد.', variant: 'error' });
      } finally {
        setUpdatingId(null);
        setActivity(`staff-status-${appointmentId}`, false);
      }
    },
    [setActivity, showToast, upsertAppointment],
  );

  const createAppointment = useCallback(
    async (payload: CreateAppointmentPayload): Promise<CreateAppointmentResult> => {
      if (isCreating) {
        return { success: false, error: 'در حال پردازش درخواست قبلی هستیم.' };
      }

      setIsCreating(true);
      setActivity('staff-create', true, 'در حال ایجاد نوبت...');

      try {
        const response = await fetch('/api/staff/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client: payload.clientId,
            service: payload.serviceId,
            provider: payload.providerId,
            schedule: {
              start: payload.start,
              end: payload.end,
              timeZone: payload.timeZone.trim() || 'UTC',
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create appointment (${response.status})`);
        }

        const result = (await response.json()) as { appointment?: unknown };

        if (!result.appointment) {
          throw new Error('Missing appointment in response');
        }

        const normalized = mapAppointmentFromApi(result.appointment);
        upsertAppointment(normalized);
        setFailedId(null);
        showToast({ description: 'نوبت با موفقیت ثبت شد.', variant: 'success' });
        return { success: true, appointment: normalized };
      } catch (error) {
        console.error(error);
        showToast({ description: 'ایجاد نوبت ممکن نشد.', variant: 'error' });
        return { success: false, error: 'ایجاد نوبت ممکن نشد.' };
      } finally {
        setIsCreating(false);
        setActivity('staff-create', false);
      }
    },
    [isCreating, setActivity, showToast, upsertAppointment],
  );

  const updateAppointmentSchedule = useCallback(
    async (
      appointmentId: string,
      payload: UpdateSchedulePayload,
    ): Promise<UpdateScheduleResult> => {
      if (isSavingSchedule) {
        return { success: false, error: 'در حال پردازش درخواست قبلی هستیم.' };
      }

      setIsSavingSchedule(true);
      setActivity(`staff-schedule-${appointmentId}`, true, 'در حال به‌روزرسانی زمان نوبت...');

      try {
        const response = await fetch(`/api/staff/appointments/${appointmentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            schedule: {
              start: payload.start,
              end: payload.end,
              timeZone: payload.timeZone,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update appointment (${response.status})`);
        }

        const result = (await response.json()) as { appointment?: unknown };

        if (!result.appointment) {
          throw new Error('Missing appointment in response');
        }

        const normalized = mapAppointmentFromApi(result.appointment);
        upsertAppointment(normalized);
        setFailedId(null);
        showToast({ description: 'زمان نوبت با موفقیت به‌روزرسانی شد.', variant: 'success' });
        return { success: true, appointment: normalized };
      } catch (error) {
        console.error(error);
        setFailedId(appointmentId);
        showToast({ description: 'ویرایش زمان نوبت ممکن نشد.', variant: 'error' });
        return { success: false, error: 'ویرایش زمان نوبت ممکن نشد.' };
      } finally {
        setIsSavingSchedule(false);
        setActivity(`staff-schedule-${appointmentId}`, false);
      }
    },
    [isSavingSchedule, setActivity, showToast, upsertAppointment],
  );

  return {
    appointments,
    providers,
    errorMessage,
    setErrorMessage,
    failedId,
    setFailedId,
    updatingId,
    isRefreshing,
    isCreating,
    isSavingSchedule,
    refreshAppointments,
    refreshProviders,
    updateAppointmentStatus,
    createAppointment,
    updateAppointmentSchedule,
  };
};

type UseDashboardFiltersResult = {
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredAppointments: StaffAppointment[];
};

export const useDashboardFilters = (
  appointments: StaffAppointment[],
): UseDashboardFiltersResult => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      if (filterStatus !== 'all' && appointment.status !== filterStatus) {
        return false;
      }
      if (searchTerm.trim().length > 0) {
        const term = searchTerm.trim().toLowerCase();
        return (
          appointment.clientEmail.toLowerCase().includes(term) ||
          appointment.providerName.toLowerCase().includes(term) ||
          (appointment.reference ?? '').toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [appointments, filterStatus, searchTerm]);

  return {
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    filteredAppointments,
  };
};

export type {
  CreateAppointmentPayload,
  CreateAppointmentResult,
  UpdateSchedulePayload,
  UpdateScheduleResult,
};
