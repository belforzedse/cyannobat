import Link from 'next/link';
import { redirect } from 'next/navigation';

import {
  DoctorDashboard,
  ReceptionistDashboard,
} from '@/components/staff/dashboard/StaffDashboard';
import {
  loadStaffDashboardData,
  loadStaffSession,
  shouldFilterAppointmentsForRoles,
} from '@/lib/staff/server/loadStaffData';

export const dynamic = 'force-dynamic';

const StaffPage = async () => {
  const { payload, user, roles, currentUser } = await loadStaffSession();

  if (shouldFilterAppointmentsForRoles(roles)) {
    redirect('/staff/doctor');
  }

  const { appointments, providers } = await loadStaffDashboardData(payload, user, roles);

  const canAccessReception = roles.includes('receptionist') || roles.includes('admin');
  const DashboardComponent = canAccessReception ? ReceptionistDashboard : DoctorDashboard;
  const showRoleSwitcher = canAccessReception && roles.includes('doctor');

  return (
    <section className="px-4 py-8 sm:px-10 sm:py-12">
      {showRoleSwitcher && (
        <div className="mb-6 flex flex-wrap items-center justify-end gap-3 text-xs text-muted-foreground sm:text-sm">
          <span>انتخاب پیشخوان:</span>
          <Link
            href="/staff/receptionist"
            className="rounded-full border border-white/20 px-4 py-1 text-foreground transition-colors hover:bg-white/10 dark:border-white/15"
          >
            پیشخوان پذیرش
          </Link>
          <Link
            href="/staff/doctor"
            className="rounded-full border border-white/20 px-4 py-1 text-foreground transition-colors hover:bg-white/10 dark:border-white/15"
          >
            پیشخوان پزشک
          </Link>
        </div>
      )}

      <DashboardComponent
        initialAppointments={appointments}
        initialProviders={providers}
        currentUser={currentUser}
      />
    </section>
  );
};

export default StaffPage;
