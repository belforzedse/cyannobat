'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Home, LifeBuoy, ListChecks } from 'lucide-react';
import { BOOKING_PATH } from '@/lib/routes';

type NavigationGroup = 'main' | 'actions';

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  ariaLabel?: string;
  group: NavigationGroup;
  matches?: (pathname: string) => boolean;
};

const navigationItems: NavigationItem[] = [
  {
    label: 'خانه',
    href: '/',
    icon: Home,
    group: 'main',
    matches: (pathname) => pathname === '/',
  },
  {
    label: 'مراحل',
    href: '/#steps',
    icon: ListChecks,
    group: 'main',
    matches: (pathname) => pathname === '/',
    ariaLabel: 'مشاهده مراحل کار سایان نوبت',
  },
  {
    label: 'رزرو نوبت',
    href: BOOKING_PATH,
    icon: CalendarDays,
    group: 'main',
    matches: (pathname) => pathname.startsWith(BOOKING_PATH),
  },
  {
    label: 'پشتیبانی',
    href: 'mailto:support@cyannobat.com',
    icon: LifeBuoy,
    group: 'actions',
    ariaLabel: 'ارسال ایمیل به پشتیبانی سایان نوبت',
  },
];

const Sidebar = () => {
  const pathname = usePathname();

  const renderItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const isActive = item.matches?.(pathname ?? '') ?? false;
    const baseClasses = clsx(
      'group flex h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-medium transition-all',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
      'hover:bg-accent/15 hover:text-foreground',
      isActive
        ? 'bg-accent/25 text-foreground shadow-inner'
        : 'text-muted'
    );

    const content = (
      <>
        <Icon
          aria-hidden
          className={clsx(
            'h-5 w-5 transition-transform duration-150',
            isActive ? 'scale-105 text-foreground' : 'text-current'
          )}
        />
        <span className="text-[11px] leading-4">{item.label}</span>
      </>
    );

    if (item.href.startsWith('mailto:') || item.href.startsWith('tel:')) {
      return (
        <a
          key={item.label}
          href={item.href}
          className={baseClasses}
          aria-label={item.ariaLabel ?? item.label}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        className={baseClasses}
        aria-label={item.ariaLabel ?? item.label}
        aria-current={isActive ? 'page' : undefined}
      >
        {content}
      </Link>
    );
  };

  const desktopMainItems = navigationItems.filter((item) => item.group === 'main');
  const desktopActionItems = navigationItems.filter((item) => item.group === 'actions');

  return (
    <nav
      aria-label="پیمایش اصلی و اقدامات سریع"
      className={clsx(
        'glass fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-2 rounded-3xl px-3 py-2 shadow-lg backdrop-blur',
        'lg:inset-auto lg:right-4 lg:top-24 lg:h-[calc(100vh-144px)] lg:w-24 lg:max-w-none lg:flex-col lg:items-center lg:justify-between lg:gap-8 lg:px-4 lg:py-6'
      )}
    >
      <ul className="flex w-full items-center justify-between gap-1 lg:hidden">
        {navigationItems.map((item) => (
          <li key={`mobile-${item.label}`} className="flex-1">
            {renderItem(item)}
          </li>
        ))}
      </ul>

      <div className="hidden h-full w-full flex-col justify-between lg:flex">
        <ul className="flex flex-col items-center gap-4">
          {desktopMainItems.map((item) => (
            <li key={`desktop-${item.label}`} className="w-full">
              {renderItem(item)}
            </li>
          ))}
        </ul>
        {desktopActionItems.length > 0 && (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="h-px w-full bg-white/20" aria-hidden />
            <ul className="flex w-full flex-col items-center gap-4">
              {desktopActionItems.map((item) => (
                <li key={`desktop-action-${item.label}`} className="w-full">
                  {renderItem(item)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
