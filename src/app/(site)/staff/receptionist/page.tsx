import { redirect } from 'next/navigation';

import { ReceptionistDashboard } from '@/components/staff/dashboard/StaffDashboard';
import { loadStaffDashboardData, loadStaffSession } from '@/lib/staff/server/loadStaffData';

export const dynamic = 'force-dynamic';

const ReceptionistStaffPage = async () => {
  const { payload, user, roles, currentUser } = await loadStaffSession({
    onUnauthorizedRedirect: '/account',
  });

  const canAccessReception = roles.includes('receptionist') || roles.includes('admin');

  if (!canAccessReception) {
    redirect('/staff');
  }

  const { appointments, providers } = await loadStaffDashboardData(payload, user, roles, {
    scope: 'receptionist',
  });

  return (
    <section className="px-4 py-8 sm:px-10 sm:py-12">
      <ReceptionistDashboard
        initialAppointments={appointments}
        initialProviders={providers}
        currentUser={currentUser}
      />
    </section>
  );
};

export default ReceptionistStaffPage;
