'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Home, LifeBuoy, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import { BOOKING_PATH } from '@/lib/routes';

type NavigationGroup = 'main' | 'actions';

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  ariaLabel?: string;
  group: NavigationGroup;
  matches?: (pathname: string, hash?: string) => boolean;
};

const navigationItems: NavigationItem[] = [
  {
    label: 'خانه',
    href: '/',
    icon: Home,
    group: 'main',
    matches: (pathname, hash) => pathname === '/' && hash !== '#steps',
  },
  {
    label: 'مراحل',
    href: '/#steps',
    icon: ListChecks,
    group: 'main',
    matches: (pathname, hash) => pathname === '/' && hash === '#steps',
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

type IndicatorPosition = {
  width: number;
  height: number;
  x: number;
  y: number;
};

const Sidebar = () => {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState('');
  const [indicator, setIndicator] = useState<IndicatorPosition | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateHash = () => {
      setActiveHash(window.location.hash || '');
    };

    updateHash();
    window.addEventListener('hashchange', updateHash);

    return () => {
      window.removeEventListener('hashchange', updateHash);
    };
  }, []);

  const activeItem = useMemo(
    () =>
      navigationItems.find((item) => item.matches?.(pathname ?? '', activeHash) ?? false) ?? null,
    [activeHash, pathname]
  );

  const calculateIndicator = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const navEl = navRef.current;

    if (!navEl || !activeItem) {
      setIndicator(null);
      return;
    }

    const candidates = Array.from(
      navEl.querySelectorAll<HTMLDivElement>(`[data-sidebar-item="${activeItem.label}"]`)
    );

    const visibleTarget = candidates.find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    if (!visibleTarget) {
      setIndicator(null);
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const activeRect = visibleTarget.getBoundingClientRect();

    setIndicator({
      width: activeRect.width,
      height: activeRect.height,
      x: activeRect.left - navRect.left,
      y: activeRect.top - navRect.top,
    });
  }, [activeItem]);

  useLayoutEffect(() => {
    calculateIndicator();
  }, [calculateIndicator]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      window.requestAnimationFrame(calculateIndicator);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateIndicator]);

  useEffect(() => {
    if (typeof window === 'undefined' || !navRef.current || !('ResizeObserver' in window)) {
      return;
    }

    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(calculateIndicator);
    });

    observer.observe(navRef.current);

    return () => {
      observer.disconnect();
    };
  }, [calculateIndicator]);

  useEffect(() => {
    setHoveredItem(null);
  }, [activeItem?.label]);

  const renderItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const isActive = item.matches?.(pathname ?? '', activeHash) ?? false;
    const baseClasses = clsx(
      'group relative flex h-14 w-full flex-col items-center justify-center gap-1 rounded-2xl text-xs font-medium transition-all',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
      'hover:bg-accent/10 hover:text-foreground',
      isActive ? 'text-foreground' : 'text-muted'
    );

    const content = (
      <>
        <Icon
          aria-hidden
          className={clsx(
            'relative z-10 h-5 w-5 transition-transform duration-150',
            isActive ? 'scale-105 text-foreground' : 'text-current'
          )}
        />
        <span className="relative z-10 text-[11px] leading-4">{item.label}</span>
      </>
    );

    const wrapperClasses = 'relative z-10 w-full';

    const motionWrapperProps = {
      whileHover: { scale: 1.03 },
      transition: { type: 'spring', stiffness: 400, damping: 35, mass: 0.8 },
      onHoverStart: () => setHoveredItem(item.label),
      onHoverEnd: () => setHoveredItem((current) => (current === item.label ? null : current)),
    } as const;

    if (item.href.startsWith('mailto:') || item.href.startsWith('tel:')) {
      return (
        <motion.div
          key={item.label}
          className={wrapperClasses}
          data-sidebar-item={item.label}
          {...motionWrapperProps}
        >
          <a
            href={item.href}
            className={baseClasses}
            aria-label={item.ariaLabel ?? item.label}
          >
            {content}
          </a>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={item.label}
        className={wrapperClasses}
        data-sidebar-item={item.label}
        {...motionWrapperProps}
      >
        <Link
          href={item.href}
          className={baseClasses}
          aria-label={item.ariaLabel ?? item.label}
          aria-current={isActive ? 'page' : undefined}
        >
          {content}
        </Link>
      </motion.div>
    );
  };

  const desktopMainItems = navigationItems.filter((item) => item.group === 'main');
  const desktopActionItems = navigationItems.filter((item) => item.group === 'actions');

  return (
    <nav
      aria-label="پیمایش اصلی و اقدامات سریع"
      className={clsx(
        'glass relative fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-2 rounded-3xl px-3 py-2 shadow-lg backdrop-blur',
        "lg:inset-auto lg:right-4 lg:top-[105px] lg:h-[calc(100vh-150px)] lg:w-24 lg:max-w-none lg:flex-col lg:items-center lg:justify-between lg:gap-8 lg:px-4 lg:py-6"
      )}
      ref={navRef}
    >
      {indicator && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="pointer-events-none absolute z-0 rounded-2xl border border-white/30 bg-gradient-to-br from-white/40 via-white/15 to-white/5 shadow-[0_12px_45px_rgba(159,221,231,0.28)] backdrop-blur-xl"
          initial={false}
          animate={{
            x: indicator.x,
            y: indicator.y,
            width: indicator.width,
            height: indicator.height,
            scale: hoveredItem && activeItem?.label === hoveredItem ? 1.05 : 1,
          }}
          transition={{ type: 'spring', stiffness: 450, damping: 40, mass: 0.8 }}
        />
      )}
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
