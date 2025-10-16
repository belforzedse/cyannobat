import type { ReactNode } from 'react';
import Nav from '@/components/Nav';

const SiteLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-8 sm:px-10 lg:px-12">
      <Nav />
      <main className="flex flex-1 flex-col gap-12">{children}</main>
      <footer className="flex flex-col items-end gap-1 text-right text-sm text-muted">
        <span>© {new Date().getFullYear()} سایان نوبت — cyannobat</span>
        <span>همراه شما برای تجربه‌ای متفاوت در رزرو آنلاین.</span>
      </footer>
    </div>
  );
};

export default SiteLayout;
