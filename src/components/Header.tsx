'use client';

import Link from 'next/link';

import AccountWidget from './AccountWidget';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { glassPillClassName, glassSurfaceClassName } from './ui/glass';
import { BOOKING_PATH } from '@/lib/routes';
import { cn } from '@/lib/utils';

const Header = () => {
  return (
    <header
      role="banner"
      className={glassSurfaceClassName(
        cn(
          'sticky top-6 z-30 mx-4 flex items-center justify-between gap-3 rounded-[20px] px-4 py-2 text-right',
          'sm:gap-5 sm:px-6 sm:py-2',
          'lg:mx-auto lg:w-full lg:max-w-6xl lg:pr-[8.5rem] xl:max-w-7xl xl:pr-[10rem] 2xl:max-w-7xl 2xl:pr-[11.5rem]',
          'shadow-lg shadow-black/5 backdrop-blur-md backdrop-saturate-30',
          'transition-all duration-300 ease-out animate-fade-in-down'
        )
      )}
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
      <div className='flex select-none items-center gap-2'>
        <Logo />
      </div>

      {/* actions */}
      <nav aria-label='primary' className='flex items-center gap-2 sm:gap-3'>
        <AccountWidget />

        <ThemeToggle />
        <Link
          href={BOOKING_PATH}
          className={glassPillClassName(
            cn(
              'inline-flex items-center px-3 py-2 text-xs font-medium text-foreground',
              'sm:px-5 sm:text-sm',
              'transition-all duration-300 ease-out hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2',
              'focus-visible:ring-offset-background'
            )
          )}
        >
          رزرو نوبت
        </Link>
      </nav>
    </header>
  );
};

export default Header;
