import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const SiteLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <div
          className="pointer-events-none absolute -left-24 top-24 hidden h-[28rem] w-[28rem] -translate-y-12 rounded-full bg-accent/25 blur-3xl sm:block -z-10 dark:bg-accent/30"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 bottom-16 h-[26rem] w-[26rem] rounded-full bg-accent-strong/20 blur-[140px] -z-10 dark:bg-accent-strong/35"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60 -z-10 dark:via-white/15"
          aria-hidden
        />
        <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-32 pt-8 sm:px-10 lg:px-12 lg:pb-16 lg:pr-24 xl:pr-32">
          {children}
        </main>
        <footer className="relative mx-auto flex w-full max-w-6xl flex-col items-end gap-1 px-6 pb-32 pt-8 text-right text-sm text-muted sm:px-10 lg:px-12 lg:pb-16 lg:pr-24 xl:pr-32">
          <span>© {new Date().getFullYear()} سایان نوبت — cyannobat</span>
          <span>همراه شما برای تجربه‌ای متفاوت در رزرو آنلاین.</span>
        </footer>
      </div>
    </div>
  );
};

export default SiteLayout;
