'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { BOOKING_PATH } from '@/lib/routes';
import Logo from './Logo';
import AccountWidget from './AccountWidget';
import { GlassSurface, GlassPill } from '@/components/ui/glass';
import { ArrowLeft, Bell } from 'lucide-react';

const navSurfaceTokens: CSSProperties = {
  '--glass-surface-border': 'rgb(var(--accent-rgb) / 0.6)',
  '--glass-surface-border-hover': 'rgb(var(--accent-rgb) / 0.72)',
  '--glass-surface-border-inner':
    'color-mix(in srgb, rgb(var(--accent-strong-rgb) / 0.55) 60%, rgba(255, 255, 255, 0.52))',
  '--glass-surface-border-inner-hover':
    'color-mix(in srgb, rgb(var(--accent-strong-rgb) / 0.66) 70%, rgba(255, 255, 255, 0.62))',
  '--glass-surface-bg':
    'linear-gradient(160deg, color-mix(in srgb, #ffffff 82%, var(--accent) 18%) 0%, color-mix(in srgb, #f7fbff 74%, var(--accent-strong) 26%) 100%)',
  '--glass-surface-bg-hover':
    'linear-gradient(160deg, color-mix(in srgb, #ffffff 74%, var(--accent) 26%) 0%, color-mix(in srgb, #f0f6ff 68%, var(--accent-deep) 32%) 100%)',
  '--glass-surface-highlight':
    'linear-gradient(180deg, rgb(var(--accent-rgb) / 0.28) 0%, rgba(255, 255, 255, 0.28) 50%, transparent 100%)',
  '--glass-surface-highlight-hover':
    'linear-gradient(180deg, rgb(var(--accent-rgb) / 0.34) 0%, rgba(255, 255, 255, 0.32) 42%, transparent 100%)',
  '--glass-surface-glow':
    'radial-gradient(140% 120% at 50% 0%, rgb(var(--accent-rgb) / 0.42) 0%, transparent 64%), radial-gradient(160% 140% at 50% 100%, rgb(var(--accent-strong-rgb) / 0.28) 0%, transparent 76%)',
  '--glass-surface-shadow':
    '0 26px 56px -32px rgb(var(--accent-strong-rgb) / 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.76), inset 0 -1px 0 rgb(var(--accent-rgb) / 0.3)',
  '--glass-surface-shadow-hover':
    '0 32px 68px -34px rgb(var(--accent-strong-rgb) / 0.52), inset 0 1px 0 rgba(255, 255, 255, 0.82), inset 0 -1px 0 rgb(var(--accent-rgb) / 0.36), 0 24px 48px rgb(var(--accent-rgb) / 0.22)',
  '--glass-surface-glow-saturation': '1.35',
  '--glass-surface-glow-saturation-hover': '1.6',
};

const ctaPillTokens: CSSProperties = {
  '--pill-border': 'rgb(var(--accent-rgb) / 0.36)',
  '--pill-border-hover': 'rgb(var(--accent-rgb) / 0.5)',
  '--pill-bg':
    'linear-gradient(135deg, color-mix(in srgb, var(--accent) 65%, #ffffff 28%) 0%, color-mix(in srgb, var(--accent-strong) 72%, #ffffff 18%) 100%)',
  '--pill-bg-hover':
    'linear-gradient(135deg, color-mix(in srgb, var(--accent) 72%, #ffffff 20%) 0%, color-mix(in srgb, var(--accent-deep) 70%, #f2f6ff 16%) 100%)',
  '--pill-shadow':
    '0 18px 38px -24px rgb(var(--accent-rgb) / 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
  '--pill-shadow-hover':
    '0 26px 54px -26px rgb(var(--accent-strong-rgb) / 0.5), 0 16px 38px -24px rgb(var(--accent-deep-rgb) / 0.35)',
  '--pill-backdrop-blur': '20px',
  '--pill-backdrop-blur-hover': '24px',
};

const Header = () => {
  return (
    <GlassSurface
      as="header"
      role="banner"
      className="sticky top-4 z-30 mx-4 flex items-center justify-between gap-3 rounded-[20px] px-8 py-4 text-right transition-all duration-300 ease-glass animate-fade-in-down sm:gap-6 sm:px-8 sm:py-4"
      style={navSurfaceTokens}
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
          className="group relative flex h-[40px] w-[48px] items-center justify-center overflow-hidden rounded-full border border-[color:var(--pill-border)] bg-[var(--pill-bg)] text-foreground shadow-[var(--pill-shadow)] backdrop-blur-[var(--pill-backdrop-blur)] transition-[background,border-color,box-shadow,transform,backdrop-filter] duration-300 ease-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:border-[color:var(--pill-border-hover)] hover:bg-[var(--pill-bg-hover)] hover:shadow-[var(--pill-shadow-hover)] hover:backdrop-blur-[var(--pill-backdrop-blur-hover)] hover:-translate-y-0.5"
        >
          <span className="sr-only">اعلان‌ها</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <AccountWidget />

        <GlassPill
          as={Link}
          href={BOOKING_PATH}
          className="inline-flex h-[40px] w-[125px] items-center gap-2 rounded-full py-2 font-medium text-white transition-transform duration-300 ease-glass hover:scale-[102%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6 sm:text-sm"
          style={ctaPillTokens}
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
