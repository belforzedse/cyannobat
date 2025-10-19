'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { BOOKING_PATH } from '@/lib/routes';

const Header = () => {
  return (
    <header
      className="glass rounded-3xl sticky top-4 z-30 flex items-center justify-between px-6 py-4 text-right mx-4 lg:mr-[122px] xl:mr-[122px] 2xl:mr-[122px] animate-fade-in-down"
      style={{
        backdropFilter: 'blur(10px) saturate(140%)',
        WebkitBackdropFilter: 'blur(10px) saturate(140%)',
      }}
    >
      {/* Very subtle cyan glow - premium feel */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/3 via-transparent to-accent/2 opacity-50 -z-20"
        aria-hidden
      />
      {/* Shimmer highlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-30 -z-10 dark:via-white/6"
        aria-hidden
      />
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            سایان نوبت
          </Link>
          <span className="text-xs text-muted-foreground">cyannobat</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={BOOKING_PATH}
          className="glass-pill hidden px-5 py-2 text-sm font-medium text-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline-flex"
        >
          رزرو نوبت
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
