'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Home, LifeBuoy, ListChecks } from 'lucide-react';
import { BOOKING_PATH } from '@/lib/routes';
import { liquidSpring } from '@/lib/animations';

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

const Sidebar = () => {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState('');

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

  const renderItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const isActive = item.matches?.(pathname ?? '', activeHash) ?? false;
    const baseClasses = clsx(
      'group flex h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-medium relative',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
      'transition-colors duration-300'
    );

    const content = (
      <>
        {/* Morphing liquid blob background for active state */}
        {isActive && (
          <motion.div
            layoutId="activeNavBlob"
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/15 backdrop-blur-sm"
            style={{
              boxShadow: '0 4px 12px rgba(159, 221, 231, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
            }}
            transition={{
              layout: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              },
            }}
            initial={false}
            aria-hidden
          />
        )}

        {/* Subtle glow effect */}
        {isActive && (
          <motion.div
            layoutId="activeNavGlow"
            className="absolute -inset-1 rounded-2xl bg-accent/15 blur-lg -z-10"
            transition={{
              layout: {
                type: 'spring',
                stiffness: 280,
                damping: 28,
                mass: 0.9,
              },
            }}
            initial={false}
            aria-hidden
          />
        )}

        {/* Icon and label */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center gap-1"
          animate={{
            scale: isActive ? 1.05 : 1,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={liquidSpring}
        >
          <Icon
            aria-hidden
            className={clsx(
              'h-5 w-5 transition-colors duration-300',
              isActive ? 'text-foreground' : 'text-current group-hover:text-foreground'
            )}
          />
          <span className={clsx(
            'text-[11px] leading-4 font-medium transition-colors duration-300',
            isActive ? 'text-foreground' : 'text-current group-hover:text-foreground'
          )}>
            {item.label}
          </span>
        </motion.div>
      </>
    );

    const MotionComponent = motion(
      item.href.startsWith('mailto:') || item.href.startsWith('tel:') ? 'a' : Link
    );

    return (
      <MotionComponent
        key={item.label}
        href={item.href}
        className={baseClasses}
        aria-label={item.ariaLabel ?? item.label}
        aria-current={isActive ? 'page' : undefined}
        whileHover={!isActive ? {
          backgroundColor: 'rgba(159, 221, 231, 0.1)',
        } : undefined}
        transition={{ duration: 0.2 }}
      >
        {content}
      </MotionComponent>
    );
  };

  const desktopMainItems = navigationItems.filter((item) => item.group === 'main');
  const desktopActionItems = navigationItems.filter((item) => item.group === 'actions');

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={liquidSpring}
      aria-label="پیمایش اصلی و اقدامات سریع"
      className={clsx(
        "glass fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-2 rounded-3xl px-3 py-2 shadow-lg backdrop-blur",
        "lg:inset-auto lg:right-4 lg:top-[105px] lg:h-[calc(100vh-150px)] lg:w-24 lg:max-w-none lg:flex-col lg:items-center lg:justify-between lg:gap-8 lg:px-4 lg:py-6"
      )}
    >
      <LayoutGroup id="mobile-nav">
        <ul className="flex w-full items-center justify-between gap-1 lg:hidden">
          {navigationItems.map((item) => (
            <li key={`mobile-${item.label}`} className="flex-1">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      </LayoutGroup>

      <LayoutGroup id="desktop-nav">
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
      </LayoutGroup>
    </motion.nav>
  );
};

export default Sidebar;
