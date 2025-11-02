'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';

import type { StaffAppointment, StaffProvider, StaffUser } from '@/lib/staff/types';
import GlassIcon from '@/components/GlassIcon';
import { GlobalLoadingOverlayProvider } from '@/components/GlobalLoadingOverlayProvider';
import { Card } from '@/components/ui';
import ProviderAvailabilityEditor from '@/components/staff/ProviderAvailabilityEditor';
import StaffUserCreationCard from '@/components/staff/StaffUserCreationCard';
import { getRoleLabel } from '@/lib/staff/utils/roleLabels';

import { AppointmentsList } from './AppointmentsList';
import { AppointmentsTable } from './AppointmentsTable';
import { AppointmentsToolbar } from './AppointmentsToolbar';
import { CreateAppointmentModal } from './CreateAppointmentModal';
import { DashboardHeader } from './DashboardHeader';
import { ScheduleEditor } from './ScheduleEditor';
import {
  dashboardCopy,
  providerCardCopy,
  searchPlaceholderByMode,
  statusOptions,
} from '@/lib/staff/dashboard/constants';
import { useAppointmentsState, useDashboardFilters } from '@/lib/staff/dashboard/hooks';
import type { CreateAppointmentPayload, UpdateSchedulePayload } from '@/lib/staff/dashboard/hooks';
import type { DashboardMode } from '@/lib/staff/dashboard/types';
import { formatDateTime } from '@/lib/staff/dashboard/utils';

type SharedDashboardProps = {
  initialAppointments: StaffAppointment[];
  initialProviders: StaffProvider[];
  currentUser: StaffUser;
};

type StaffDashboardProps = SharedDashboardProps & {
  mode: DashboardMode;
};

const StaffDashboardContent = ({
  initialAppointments,
  initialProviders,
  currentUser,
  mode,
}: StaffDashboardProps) => {
  const reducedMotionSetting = useReducedMotion();
  const prefersReducedMotion = reducedMotionSetting ?? false;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const {
    appointments,
    providers,
    errorMessage,
    setErrorMessage,
    failedId,
    updatingId,
    isRefreshing,
    isCreating,
    isSavingSchedule,
    refreshAppointments,
    refreshProviders,
    updateAppointmentStatus,
    createAppointment,
    updateAppointmentSchedule,
  } = useAppointmentsState({
    initialAppointments,
    initialProviders,
    mode,
  });

  const { filterStatus, setFilterStatus, searchTerm, setSearchTerm, filteredAppointments } =
    useDashboardFilters(appointments);

  const canCreateAppointments = useMemo(
    () => currentUser.roles.includes('receptionist'),
    [currentUser.roles],
  );

  const isAdmin = currentUser.roles.includes('admin');
  const showProviderColumn = mode === 'receptionist';
  const showUserManagement = mode === 'receptionist' || isAdmin;
  const totalColumns = showProviderColumn ? 7 : 6;

  const handleLogout = useCallback(async () => {
    await fetch('/api/staff/logout', {
      method: 'POST',
    });
    window.location.href = '/staff/login';
  }, []);

  const handleRefresh = useCallback(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  const handleStatusChange = useCallback(
    (id: string, status: StaffAppointment['status']) => {
      setErrorMessage(null);
      updateAppointmentStatus(id, status);
    },
    [setErrorMessage, updateAppointmentStatus],
  );

  const handleScheduleOpen = useCallback((appointment: StaffAppointment) => {
    setEditingScheduleId(appointment.id);
  }, []);

  const handleScheduleCancel = useCallback(() => {
    setEditingScheduleId(null);
  }, []);

  const handleScheduleSubmit = useCallback(
    async (appointmentId: string, payload: UpdateSchedulePayload) => {
      return updateAppointmentSchedule(appointmentId, payload);
    },
    [updateAppointmentSchedule],
  );

  const handleCreateSubmit = useCallback(
    async (payload: CreateAppointmentPayload) => {
      const result = await createAppointment(payload);
      return result;
    },
    [createAppointment],
  );

  const handleCreateModalOpen = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateModalClose = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const renderScheduleEditor = useCallback(
    (appointment: StaffAppointment) => (
      <ScheduleEditor
        key={appointment.id}
        appointment={appointment}
        isSaving={isSavingSchedule}
        onCancel={handleScheduleCancel}
        onSubmit={handleScheduleSubmit}
        onSuccess={() => setEditingScheduleId(null)}
      />
    ),
    [handleScheduleCancel, handleScheduleSubmit, isSavingSchedule],
  );

  const roleSummary = useMemo(
    () => currentUser.roles.map(getRoleLabel).join('، '),
    [currentUser.roles],
  );

  const copy = dashboardCopy[mode];
  const providerCopy = providerCardCopy[mode];

  return (
    <motion.div
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="mx-auto flex w-full max-w-6xl flex-col gap-8"
    >
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        providers={providers}
        isCreating={isCreating}
        onSubmit={handleCreateSubmit}
      />

      <DashboardHeader
        title={copy.title}
        description={copy.description}
        email={currentUser.email}
        roleSummary={roleSummary}
        prefersReducedMotion={prefersReducedMotion}
        onLogout={handleLogout}
      />

      {showUserManagement && (
        <motion.div
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: prefersReducedMotion ? 0 : 0.2,
            duration: prefersReducedMotion ? 0 : 0.5,
          }}
        >
          <StaffUserCreationCard currentUser={currentUser} />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: prefersReducedMotion ? 0 : 0.3,
          duration: prefersReducedMotion ? 0 : 0.5,
        }}
      >
        <Card variant="default" padding="lg" className="flex flex-col gap-6 text-right">
          <div className="flex flex-col gap-1 text-right">
            <div className="flex w-full items-center justify-between">
              <GlassIcon icon={Calendar} size="sm" label="مدیریت نوبت‌ها" />
              <h2 className="text-lg font-semibold text-foreground">مدیریت نوبت‌ها</h2>
            </div>
            <p className="text-xs text-muted-foreground">فهرست نوبت‌های رزرو شده در بازه پیش‌رو.</p>
          </div>

          <AppointmentsToolbar
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder={searchPlaceholderByMode[mode]}
            canCreateAppointments={canCreateAppointments}
            onCreateClick={handleCreateModalOpen}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            prefersReducedMotion={prefersReducedMotion}
            statusOptions={statusOptions}
          />

          {errorMessage && (
            <div className="rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="space-y-6">
            <AppointmentsTable
              appointments={filteredAppointments}
              showProviderColumn={showProviderColumn}
              statusOptions={statusOptions}
              onStatusChange={handleStatusChange}
              updatingId={updatingId}
              failedId={failedId}
              editingScheduleId={editingScheduleId}
              onEditSchedule={handleScheduleOpen}
              renderScheduleEditor={renderScheduleEditor}
              formatDateTime={formatDateTime}
              totalColumns={totalColumns}
            />

            <AppointmentsList
              appointments={filteredAppointments}
              showProviderColumn={showProviderColumn}
              statusOptions={statusOptions}
              onStatusChange={handleStatusChange}
              updatingId={updatingId}
              failedId={failedId}
              editingScheduleId={editingScheduleId}
              onEditSchedule={handleScheduleOpen}
              renderScheduleEditor={renderScheduleEditor}
              formatDateTime={formatDateTime}
            />
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: prefersReducedMotion ? 0 : 0.35,
          duration: prefersReducedMotion ? 0 : 0.5,
        }}
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
  );
};

const RoleAwareDashboard = (props: StaffDashboardProps) => (
  <GlobalLoadingOverlayProvider>
    <StaffDashboardContent {...props} />
  </GlobalLoadingOverlayProvider>
);

export const DoctorDashboard = (props: SharedDashboardProps) => (
  <RoleAwareDashboard {...props} mode="doctor" />
);

export const ReceptionistDashboard = (props: SharedDashboardProps) => (
  <RoleAwareDashboard {...props} mode="receptionist" />
);

export type { SharedDashboardProps as StaffDashboardInputProps };
