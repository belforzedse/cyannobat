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
      interactive={false}
      className="sticky top-4 z-30 mx-4 flex items-center justify-between gap-3 rounded-[20px] px-8  text-right transition-all duration-300 ease-glass animate-fade-in-down sm:gap-6 sm:px-8  h-[64px]"
    >

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
          className="group relative flex h-[44px] w-[48px] items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white text-foreground shadow-sm backdrop-blur-xl transition-all duration-300 ease-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-black/80"
        >
          <span className="sr-only">اعلان‌ها</span>
          <Bell className="h-5 w-5 text-[#4177AC] dark:text-[#6FA5DB]" aria-hidden="true" />
        </button>
        <AccountWidget />

        <GlassPill
          as={Link}
          href={BOOKING_PATH}
          className="inline-flex items-center gap-2 rounded-full h-[44px] w-[125px] py-1   font-medium text-white transition-all duration-300 ease-glass hover:scale-[102%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background  sm:text-sm"
          style={{
            backgroundImage: 'linear-gradient(to right, #7DB0DF, #7D9ADF)',
            boxShadow: '0 14px 32px -22px rgba(125, 176, 223, 0.3)',
          }}
          data-theme-dark-gradient="true"
        >
          <span className="text-base font-light">رزرو نوبت</span>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </GlassPill>
      </nav>
    </GlassSurface>
  );
};

export default Header;
