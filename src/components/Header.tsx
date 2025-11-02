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
      className=" sticky top-4 z-30 ml-6 mr-4 flex items-center justify-between gap-3 rounded-[20px] px-6 py-2 text-right shadow-lg shadow-black/5 transition-all duration-300 ease-glass animate-fade-in-down sm:gap-6 sm:px-6 sm:py-2 backdrop-blur-md backdrop-saturate-30"
    >
      {/* soft accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 rounded-[20px] bg-gradient-to-br from-accent/5 via-transparent to-accent/5 opacity-50"
      />
      {/* hairline sheen */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-0 -z-10 rounded-[20px]
          bg-gradient-to-r from-transparent via-white/15 to-transparent
          opacity-30 dark:via-white/10
        "
      />

      {/* Logo */}
      <div className="flex items-center gap-2 select-none">
        <Logo />
      </div>

      {/* actions */}
      <nav aria-label="primary" className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <button
          type="button"
          aria-label="اعلان‌ها"
          className="group relative flex h-[40px] w-[48px] items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/30 text-foreground shadow-sm backdrop-blur-xl transition-all duration-300 ease-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-black/80"
        >
          <span className="sr-only">اعلان‌ها</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <AccountWidget />

        <GlassPill
          as={Link}
          href={BOOKING_PATH}
          className="inline-flex items-center gap-2 rounded-full h-[40px] w-[125px]  py-2  font-medium text-white transition-all duration-300 ease-glass hover:scale-[102%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6 sm:text-sm"
          style={{
            backgroundImage: 'linear-gradient(to right, #7DB0DF, #7D9ADF)',
            boxShadow: '0 14px 32px -22px rgba(125, 176, 223, 0.3)',
          }}
          data-theme-dark-gradient="true"
        >
          <span>رزرو نوبت</span>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </GlassPill>
      </nav>
    </GlassSurface>
  );
};

export default Header;
