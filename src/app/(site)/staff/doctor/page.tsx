import { redirect } from 'next/navigation';

import { DoctorDashboard } from '@/components/staff/dashboard/StaffDashboard';
import { loadStaffDashboardData, loadStaffSession } from '@/lib/staff/server/loadStaffData';

export const dynamic = 'force-dynamic';

const DoctorStaffPage = async () => {
  const { payload, user, roles, currentUser } = await loadStaffSession({
    onUnauthorizedRedirect: '/account',
  });

  if (!roles.includes('doctor')) {
    redirect('/staff');
  }

  const { appointments, providers } = await loadStaffDashboardData(payload, user, roles, {
    scope: 'doctor',
  });

  return (
    <section className="px-4 py-8 sm:px-10 sm:py-12">
      <DoctorDashboard
        initialAppointments={appointments}
        initialProviders={providers}
        currentUser={currentUser}
      />
    </section>
  );
};

export default DoctorStaffPage;
