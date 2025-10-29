"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { BOOKING_PATH } from "@/lib/routes";
import Logo from "./Logo";
import AccountWidget from "./AccountWidget";

const Header = () => {
  return (
    <header
      role="banner"
      className=" bg-white/50
        glass sticky top-4 z-30 mx-4 rounded-[20px] px-4 py-2 sm:px-6 sm:py-2
        flex items-center justify-between gap-3 sm:gap-6 text-right
        shadow-lg shadow-black/5
        transition-all duration-300 ease-out
        animate-fade-in-down
        backdrop-blur-md backdrop-saturate-30
      "
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
        <Link
          href={BOOKING_PATH}
          className="
            glass-pill inline-flex items-center px-3 py-2 text-xs font-medium text-foreground
            sm:px-5 sm:text-sm
            transition-all duration-300 ease-out hover:text-foreground
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2
            focus-visible:ring-offset-background
          "
        >
          رزرو نوبت
        </Link>
      </nav>
    </header>
  );
};

export default Header;
