"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { BOOKING_PATH } from "@/lib/routes";

const Header = () => {
  return (
    <header
      role="banner"
      className="
        glass sticky top-4 z-30 mx-4 rounded-3xl px-4 py-3 sm:px-6 sm:py-4
        flex items-center justify-between gap-3 sm:gap-6 text-right
        lg:mr-[122px] xl:mr-[122px] 2xl:mr-[122px]
        animate-fade-in-down
        backdrop-blur-md backdrop-saturate-150
      "
    >
      {/* soft accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 rounded-3xl bg-gradient-to-br from-accent/5 via-transparent to-accent/5 opacity-50"
      />
      {/* hairline sheen */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-0 -z-10 rounded-3xl
          bg-gradient-to-r from-transparent via-white/15 to-transparent
          opacity-30 dark:via-white/10
        "
      />

      {/* brand */}
      <Link href="/" className="flex items-center gap-2 select-none">
        <div className="flex flex-col text-right leading-tight">
          <span className="text-sm font-semibold tracking-tight text-foreground">سایان نوبت</span>
          <span className="text-xs text-muted-foreground">cyannobat</span>
        </div>
      </Link>

      {/* actions */}
      <nav aria-label="primary" className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/account"
          className="
            glass-pill hidden sm:inline-flex px-5 py-2 text-sm font-medium text-foreground
            transition-colors hover:text-foreground
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2
            focus-visible:ring-offset-background
          "
        >
          حساب کاربری
        </Link>

        <Link
          href={BOOKING_PATH}
          className="
            glass-pill inline-flex items-center px-3 py-2 text-xs font-medium text-foreground
            sm:px-5 sm:text-sm
            transition-colors hover:text-foreground
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2
            focus-visible:ring-offset-background
          "
        >
          رزرو نوبت
        </Link>

        <ThemeToggle />
      </nav>
    </header>
  );
};

export default Header;
