'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Home, LifeBuoy, UserCircle } from 'lucide-react';
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

const SidebarAccountWidget = ({ layout }: { layout: 'mobile' | 'desktop' }) => {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>({ status: 'loading' });

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

  const handleLogin = () => {
    router.push('/login');
  };

  const containerClassName = clsx('w-full', layout === 'mobile' ? 'mt-4' : undefined);
  const cardClassName = 'rounded-2xl border border-white/10 bg-white/5 p-4 text-right shadow-sm backdrop-blur-sm';
  const linkClassName =
    'rounded-full border border-accent/40 px-3 py-1.5 text-xs font-semibold text-accent transition hover:border-accent hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

  if (session.status === 'loading') {
    return (
      <div className={clsx(containerClassName, cardClassName, 'animate-pulse')}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20" aria-hidden />
          <div className="flex flex-col gap-2 text-right">
            <div className="h-3 w-20 rounded-full bg-white/20" aria-hidden />
            <div className="h-3 w-28 rounded-full bg-white/10" aria-hidden />
          </div>
        </div>
      </div>
    );
  }

  if (session.status === 'unauthenticated') {
    return (
      <div className={containerClassName}>
        <button
          type="button"
          onClick={handleLogin}
          className="flex w-full flex-col items-end gap-2 rounded-2xl bg-gradient-to-br from-accent to-accent/80 px-4 py-4 text-right text-sm font-semibold text-background shadow-lg transition hover:from-accent/90 hover:to-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <div className="flex w-full items-center justify-between gap-3">
            <span>ورود یا ثبت‌نام</span>
            <UserCircle aria-hidden className="h-6 w-6" />
          </div>
          <p className="text-xs font-normal text-background/80">برای مدیریت نوبت‌ها وارد حساب خود شوید</p>
        </button>
      </div>
    );
  }

  return (
    <div className={clsx(containerClassName, cardClassName)}>
      <div className="flex items-center gap-3">
        <UserCircle aria-hidden className="h-10 w-10 text-accent" />
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-semibold text-foreground">{session.user.email}</p>
          <p className="text-xs text-muted-foreground">
            {session.isStaff ? 'اعضای کادر درمان' : 'کاربر سایان نوبت'}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Link href="/account" className={linkClassName}>
          حساب کاربری
        </Link>
        {session.isStaff ? (
          <Link href="/staff" className={linkClassName}>
            پیشخوان کارکنان
          </Link>
        ) : null}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const pathname = usePathname();
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
  }, [pathname, activeHash]);

  const renderItem = (item: NavigationItem, index: number, isMobile: boolean) => {
    const Icon = item.icon;
    const isActive = item.matches?.(pathname ?? '', activeHash) ?? false;
    const baseClasses = clsx(
      'group flex h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-medium relative',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
      // Only show hover on non-active items - NO transitions for performance
      !isActive && 'hover:bg-accent/10'
    );

    const content = (
      <div className="relative z-10 flex flex-col items-center justify-center gap-1">
        <Icon
          aria-hidden
          className={clsx(
            'h-5 w-5',
            isActive ? 'text-foreground' : 'text-current group-hover:text-foreground'
          )}
        />
        <span className={clsx(
          'text-[11px] leading-4 font-medium',
          isActive ? 'text-foreground' : 'text-current group-hover:text-foreground'
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
      <SidebarAccountWidget layout="mobile" />

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
        <div className="flex w-full flex-col items-center gap-4">
          <SidebarAccountWidget layout="desktop" />
          {desktopActionItems.length > 0 && (
            <>
              <div className="h-px w-full bg-white/20" aria-hidden />
              <ul className="flex w-full flex-col items-center gap-4">
                {desktopActionItems.map((item, index) => (
                  <li key={`desktop-action-${item.label}`} className="w-full">
                    {renderItem(item, desktopMainItems.length + index, false)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
