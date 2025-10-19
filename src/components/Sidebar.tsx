'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Home, LifeBuoy, Loader2, UserCircle } from 'lucide-react';
import { BOOKING_PATH } from '@/lib/routes';

type NavigationGroup = 'main' | 'actions';

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  ariaLabel?: string;
  group: NavigationGroup;
  disabled?: boolean;
  iconClassName?: string;
  matches?: (pathname: string, hash?: string) => boolean;
};

const baseNavigationItems: NavigationItem[] = [
  {
    label: 'خانه',
    href: '/',
    icon: Home,
    group: 'main',
    matches: (pathname, hash) => pathname === '/' && hash !== '#steps',
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

type SessionState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | {
      status: 'authenticated';
      user: { id: string; email: string; roles: string[] };
      isStaff: boolean;
    };

const Sidebar = () => {
  const pathname = usePathname();
  const [session, setSession] = useState<SessionState>({ status: 'loading' });
  const [activeHash, setActiveHash] = useState('');
  const [indicatorStyle, setIndicatorStyle] = useState<{
    mobile: { left: number; width: number };
    desktop: { top: number; height: number };
  }>({
    mobile: { left: 0, width: 0 },
    desktop: { top: 0, height: 0 },
  });

  const mobileItemRefs = useRef<(HTMLElement | null)[]>([]);
  const desktopItemRefs = useRef<(HTMLElement | null)[]>([]);
  const mobileNavRef = useRef<HTMLUListElement>(null);
  const desktopNavRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      try {
        const response = await fetch('/api/account/session', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }

        const data: {
          authenticated: boolean;
          user?: { id: string; email?: string; roles?: unknown };
          isStaff?: boolean;
        } = await response.json();

        if (!isMounted) {
          return;
        }

        if (data.authenticated && data.user) {
          const roles = Array.isArray(data.user.roles)
            ? data.user.roles.filter((role): role is string => typeof role === 'string')
            : [];

          setSession({
            status: 'authenticated',
            user: {
              id: String(data.user.id),
              email: data.user.email ?? '',
              roles,
            },
            isStaff: Boolean(data.isStaff),
          });
          return;
        }

        setSession({ status: 'unauthenticated' });
      } catch {
        if (isMounted) {
          setSession({ status: 'unauthenticated' });
        }
      }
    };

    fetchSession();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const navigationItems: NavigationItem[] = useMemo(() => {
    const accountMatches = (currentPathname: string) => {
      if (!currentPathname) {
        return false;
      }

      if (session.status !== 'authenticated') {
        return currentPathname.startsWith('/login');
      }

      if (session.isStaff) {
        return currentPathname.startsWith('/staff') || currentPathname.startsWith('/account');
      }

      return currentPathname.startsWith('/account');
    };

    const accountNavigationItem: NavigationItem = {
      label:
        session.status === 'authenticated'
          ? session.isStaff
            ? 'پیشخوان'
            : 'حساب من'
          : 'ورود',
      href:
        session.status === 'authenticated'
          ? session.isStaff
            ? '/staff'
            : '/account'
          : '/login',
      icon: session.status === 'loading' ? Loader2 : UserCircle,
      iconClassName: session.status === 'loading' ? 'animate-spin' : undefined,
      ariaLabel:
        session.status === 'authenticated'
          ? session.isStaff
            ? 'مشاهده پیشخوان کادر درمان'
            : 'مشاهده حساب کاربری'
          : 'ورود یا ثبت‌نام در سایان نوبت',
      group: 'actions',
      disabled: session.status === 'loading',
      matches: (currentPathname) => accountMatches(currentPathname ?? ''),
    };

    return [...baseNavigationItems, accountNavigationItem];
  }, [session]);

  // Update indicator position when active item changes
  useEffect(() => {
    const updateIndicatorPosition = () => {
      // Find active item index
      const activeIndex = navigationItems.findIndex(item =>
        item.matches?.(pathname ?? '', activeHash) ?? false
      );

      if (activeIndex === -1) {
        return;
      }

      // Update mobile indicator
      const mobileItem = mobileItemRefs.current[activeIndex];
      const mobileNav = mobileNavRef.current;
      if (mobileItem && mobileNav) {
        const navRect = mobileNav.getBoundingClientRect();
        const itemRect = mobileItem.getBoundingClientRect();
        setIndicatorStyle(prev => ({
          ...prev,
          mobile: {
            left: itemRect.left - navRect.left,
            width: itemRect.width,
          },
        }));
      }

      // Update desktop indicator (only main items)
      const desktopMainItems = navigationItems.filter(item => item.group === 'main');
      const desktopActiveIndex = desktopMainItems.findIndex(item =>
        item.matches?.(pathname ?? '', activeHash) ?? false
      );

      if (desktopActiveIndex !== -1) {
        const desktopItem = desktopItemRefs.current[desktopActiveIndex];
        const desktopNav = desktopNavRef.current;
        if (desktopItem && desktopNav) {
          const navRect = desktopNav.getBoundingClientRect();
          const itemRect = desktopItem.getBoundingClientRect();
          setIndicatorStyle(prev => ({
            ...prev,
            desktop: {
              top: itemRect.top - navRect.top,
              height: itemRect.height,
            },
          }));
        }
      }
    };

    updateIndicatorPosition();

    // Update on resize
    window.addEventListener('resize', updateIndicatorPosition);
    return () => window.removeEventListener('resize', updateIndicatorPosition);
  }, [pathname, activeHash, navigationItems]);

  const renderItem = (item: NavigationItem, index: number, isMobile: boolean) => {
    const Icon = item.icon;
    const isActive = item.matches?.(pathname ?? '', activeHash) ?? false;
    const baseClasses = clsx(
      'group flex h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-medium relative',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
      // Only show hover on non-active items - NO transitions for performance
      !isActive && 'hover:bg-accent/10',
      item.disabled && 'pointer-events-none opacity-50'
    );

    const content = (
      <div className="relative z-10 flex flex-col items-center justify-center gap-1">
        <Icon
          aria-hidden
          className={clsx(
            'h-5 w-5',
            item.iconClassName,
            item.disabled
              ? 'text-muted-foreground'
              : isActive
                ? 'text-foreground'
                : 'text-current group-hover:text-foreground'
          )}
        />
        <span className={clsx(
          'text-[11px] leading-4 font-medium',
          item.disabled
            ? 'text-muted-foreground'
            : isActive
              ? 'text-foreground'
              : 'text-current group-hover:text-foreground'
        )}>
          {item.label}
        </span>
      </div>
    );

    const Component = item.href.startsWith('mailto:') || item.href.startsWith('tel:') ? 'a' : Link;

    return (
      <Component
        key={item.label}
        ref={(el) => {
          if (isMobile) {
            mobileItemRefs.current[index] = el;
          } else {
            desktopItemRefs.current[index] = el;
          }
        }}
        href={item.href}
        className={baseClasses}
        aria-label={item.ariaLabel ?? item.label}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={item.disabled ? 'true' : undefined}
      >
        {content}
      </Component>
    );
  };

  const desktopMainItems = navigationItems.filter((item) => item.group === 'main');
  const desktopActionItems = navigationItems.filter((item) => item.group === 'actions');

  const hasActiveItem = navigationItems.some(item => item.matches?.(pathname ?? '', activeHash) ?? false);
  const hasActiveMainItem = desktopMainItems.some(item => item.matches?.(pathname ?? '', activeHash) ?? false);

  return (
    <nav
      aria-label="پیمایش اصلی و اقدامات سریع"
      className={clsx(
        "glass fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-2 rounded-3xl px-3 py-2 shadow-lg backdrop-blur",
        "lg:inset-auto lg:right-4 lg:top-[105px] lg:h-[calc(100vh-150px)] lg:w-24 lg:max-w-none lg:flex-col lg:items-center lg:justify-between lg:gap-8 lg:px-4 lg:py-6",
        "animate-fade-in-up"
      )}
    >
      {/* Mobile Navigation */}
      <ul ref={mobileNavRef} className="flex w-full items-center justify-between gap-1 lg:hidden relative">
        {/* Morphing active indicator for mobile */}
        {hasActiveItem && indicatorStyle.mobile.width > 0 && (
          <div
            className="absolute rounded-2xl bg-gradient-to-br from-accent/20 to-accent/15 backdrop-blur-sm pointer-events-none -z-10"
            style={{
              left: 0,
              width: `${indicatorStyle.mobile.width}px`,
              height: '56px', // h-14
              top: 0,
              transform: `translateX(${indicatorStyle.mobile.left}px)`,
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 4px 12px rgba(159, 221, 231, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
              willChange: 'transform',
            }}
            aria-hidden
          />
        )}
        {navigationItems.map((item, index) => (
          <li key={`mobile-${item.label}`} className="flex-1">
            {renderItem(item, index, true)}
          </li>
        ))}
      </ul>

      {/* Desktop Navigation */}
      <div className="hidden h-full w-full flex-col justify-between lg:flex">
        <ul ref={desktopNavRef} className="flex flex-col items-center gap-4 relative">
          {/* Morphing active indicator for desktop */}
          {hasActiveMainItem && indicatorStyle.desktop.height > 0 && (
            <div
              className="absolute rounded-2xl bg-gradient-to-br from-accent/20 to-accent/15 backdrop-blur-sm pointer-events-none -z-10"
              style={{
                top: 0,
                height: `${indicatorStyle.desktop.height}px`,
                left: 0,
                right: 0,
                transform: `translateY(${indicatorStyle.desktop.top}px)`,
                transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 12px rgba(159, 221, 231, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                willChange: 'transform',
              }}
              aria-hidden
            />
          )}
          {desktopMainItems.map((item, index) => (
            <li key={`desktop-${item.label}`} className="w-full">
              {renderItem(item, index, false)}
            </li>
          ))}
        </ul>
        {desktopActionItems.length > 0 && (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="h-px w-full bg-white/20" aria-hidden />
            <ul className="flex w-full flex-col items-center gap-4">
              {desktopActionItems.map((item, index) => (
                <li key={`desktop-action-${item.label}`} className="w-full">
                  {renderItem(item, desktopMainItems.length + index, false)}
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
