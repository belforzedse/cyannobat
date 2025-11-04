import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ThemeProvider from '@/components/ThemeProvider';


export const metadata = {
  title: 'سایان نوبت | cyannobat',
  description: 'رزرو نوبت سریع، ساده و شفاف',
};

const SiteLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen w-full overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20"
          style={{ background: 'var(--bg-gradient)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-80"
          style={{ background: 'var(--bg-gradient-overlay)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-[5]"
          style={{ background: 'var(--bg-vignette)' }}
        />
        <div className="relative z-10 flex min-h-screen w-full">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col">
            <Header />
            {/* Main Content Area */}
            <main className="relative flex w-full flex-col gap-12 px-6 pb-32 pt-8 lg:pb-16 lg:pr-[7rem] ">
              {children}
            </main>
            <footer className="relative flex w-full flex-col items-end gap-1 px-6 pb-32 pt-8 text-right text-sm text-muted-foreground sm:px-10 lg:px-16 lg:pb-16 lg:pr-[8.5rem] xl:pr-[10rem] 2xl:pr-[11.5rem]">
              <span>© {new Date().getFullYear()} سایان نوبت — cyannobat</span>
              <span>همراه شما برای تجربه‌ای متفاوت در رزرو آنلاین.</span>
            </footer>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default SiteLayout;
