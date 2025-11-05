import CalendarView from './CalendarView';
import DocumentPreviewPanel from './DocumentPreviewPanel';
import PrescriptionActions from './PrescriptionActions';
import PrivateNotesPanel from './PrivateNotesPanel';
import ThemeCustomizer from './ThemeCustomizer';

const StaffDashboardShowcase = () => {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <CalendarView />
      <div className="grid gap-8 lg:grid-cols-2">
        <PrivateNotesPanel />
        <DocumentPreviewPanel />
      </div>
      <PrescriptionActions />
      <ThemeCustomizer />
    </main>
  );
};

export default StaffDashboardShowcase;
