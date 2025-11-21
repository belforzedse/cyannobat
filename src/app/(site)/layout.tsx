import type { ReactNode } from 'react';
import { Header, Sidebar } from '@/components/layout';
import { ThemeProvider } from '@/components/theme';


export const metadata = {
  title: 'سایان نوبت | cyannobat',
  description: 'رزرو نوبت سریع، ساده و شفاف',
};

const SiteLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <div className="relative flex min-h-screen w-full">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Header />
          {/* Main Content Area */}
          <div
            className="pointer-events-none fixed -left-24 top-24 hidden h-[28rem] w-[28rem] -translate-y-12 rounded-full bg-accent/45 blur-3xl sm:block -z-20 dark:bg-accent/30"
            aria-hidden
          />
          <div
            className="pointer-events-none fixed -right-32 bottom-16 h-[26rem] w-[26rem] rounded-full bg-accent-strong/28 blur-[140px] -z-20 dark:bg-accent-strong/35"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60 -z-10 dark:via-white/15"
            aria-hidden
          />
          <main className="relative flex w-full flex-col gap-12 px-6 pb-32 pt-8 lg:pb-16 lg:pr-[7rem] ">
            {children}
          </main>
          <footer className="relative flex w-full flex-col items-end gap-1 px-6 pb-32 pt-8 text-right text-sm text-muted-foreground sm:px-10 lg:px-16 lg:pb-16 lg:pr-[8.5rem] xl:pr-[10rem] 2xl:pr-[11.5rem]">
            <span>© {new Date().getFullYear()} سایان نوبت — cyannobat</span>
            <span>همراه شما برای تجربه‌ای متفاوت در رزرو آنلاین.</span>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default SiteLayout;
