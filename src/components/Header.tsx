"use client";

import clsx from "clsx";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { BOOKING_PATH } from "@/lib/routes";
import Logo from "./Logo";
import AccountWidget from "./AccountWidget";
import { GlassSurface, GlassPill } from '@/components/ui/glass';
import animations from './animations.module.css';

const Header = () => {
  return (
    <GlassSurface
      as="header"
      role="banner"
      className={clsx(
        "bg-white/50 sticky top-4 z-30 mx-4 flex items-center justify-between gap-3 rounded-[20px] px-4 py-2 text-right shadow-lg shadow-black/5 transition-all duration-300 ease-out sm:gap-6 sm:px-6 sm:py-2 backdrop-blur-md backdrop-saturate-30",
        animations.fadeInDown
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
      <div className="flex items-center gap-2 select-none">
        <Logo />
      </div>

      {/* actions */}
      <nav aria-label="primary" className="flex items-center gap-2 sm:gap-3">
        <AccountWidget />

        <ThemeToggle />
        <GlassPill
          as={Link}
          href={BOOKING_PATH}
          className="inline-flex items-center px-3 py-2 text-xs font-medium text-foreground transition-all duration-300 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-5 sm:text-sm"
        >
          رزرو نوبت
        </GlassPill>
      </nav>
    </GlassSurface>
  );
};

export default Header;
