import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ThemeProvider from '@/components/ThemeProvider';
import AmbientBackground from '@/components/layout/AmbientBackground';
import PageSection from '@/components/layout/PageSection';
import { cn } from '@/lib/utils';
import { glassClasses } from '@/components/ui/glass';

export const metadata = {
  title: 'سایان نوبت | cyannobat',
  description: 'رزرو نوبت سریع، ساده و شفاف',
};

const SiteLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <div className={cn('relative flex min-h-screen w-full', glassClasses.fallback)}>
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Header />
          <AmbientBackground />
          <PageSection as="main" className="gap-12">
            {children}
          </PageSection>
          <PageSection
            as="footer"
            className="items-end gap-1 text-right text-sm text-muted-foreground"
          >
            <span>© {new Date().getFullYear()} سایان نوبت — cyannobat</span>
            <span>همراه شما برای تجربه‌ای متفاوت در رزرو آنلاین.</span>
          </PageSection>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default SiteLayout;
