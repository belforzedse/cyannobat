'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { BOOKING_PATH } from '@/lib/routes';
import Logo from './Logo';
import AccountWidget from './AccountWidget';
import { GlassSurface, GlassPill } from '@/components/ui/glass';
import { ArrowLeft, Bell } from 'lucide-react';

const Header = () => {
  return (
    <GlassSurface
      as="header"
      role="banner"
      className="sticky top-4 z-30 ml-6 mr-4 flex items-center justify-between gap-4 overflow-hidden rounded-[26px] px-8 py-3.5 text-right shadow-lg shadow-black/5 transition-all duration-300 ease-glass animate-fade-in-down sm:gap-7 sm:px-10 sm:py-4 backdrop-blur-xl backdrop-saturate-[1.7]"
    >
      {/* soft accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[-14px] -z-30 rounded-[36px] bg-[radial-gradient(140%_160%_at_12%_18%,rgba(125,176,223,0.35),transparent_56%),radial-gradient(140%_160%_at_88%_82%,rgba(80,140,222,0.32),transparent_60%)] blur-[18px]"
      />
      {/* glass belly highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1px] -z-20 rounded-[inherit] border border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.65)_0%,rgba(255,255,255,0.22)_46%,rgba(255,255,255,0.06)_100%)] dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(12,22,38,0.24)_52%,rgba(12,22,38,0.4)_100%)]"
      />
      {/* topline sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-3 top-1 -z-10 h-[55%] rounded-full bg-gradient-to-b from-white/70 via-white/20 to-transparent opacity-80 dark:from-white/25 dark:via-white/10"
      />

      {/* Logo */}
      <div className="flex items-center gap-3 rounded-full px-3 py-1.5 select-none sm:px-4">
        <Logo />
      </div>

      {/* actions */}
      <nav aria-label="primary" className="flex items-center gap-3.5 sm:gap-5">
        <ThemeToggle />
        <AccountWidget />
        <button
          type="button"
          aria-label="اعلان‌ها"
          className="group relative flex h-[40px] w-[48px] items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/30 text-foreground shadow-sm backdrop-blur-xl transition-all duration-300 ease-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-black/80"
        >
          <span className="sr-only">اعلان‌ها</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <GlassPill
          as={Link}
          href={BOOKING_PATH}
          className="group relative inline-flex h-12 min-w-[184px] items-center justify-start gap-3 overflow-hidden rounded-full px-5 text-sm font-semibold text-white transition-all duration-300 ease-glass hover:scale-[101%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6"
          style={{
            backgroundImage:
              'linear-gradient(135deg, color-mix(in srgb, var(--accent) 88%, white 12%), color-mix(in srgb, var(--accent-strong) 92%, var(--accent-deep) 18%))',
            boxShadow: 'var(--shadow-glass-strong)',
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full border border-white/20 opacity-70 mix-blend-screen"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-3 top-1 h-[55%] rounded-full bg-white/45 opacity-70 blur-[18px] mix-blend-screen dark:bg-white/20"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(160%_120%_at_12%_16%,rgba(255,255,255,0.4),transparent_56%),radial-gradient(140%_140%_at_85%_84%,rgba(76,145,255,0.45),transparent_62%)] opacity-0 transition-opacity duration-500 ease-glass group-hover:opacity-100"
          />
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_18px_-12px_rgba(15,23,42,0.45)]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="relative flex-1 text-right">رزرو نوبت</span>
        </GlassPill>
      </nav>
    </GlassSurface>
  );
};

export default Header;
