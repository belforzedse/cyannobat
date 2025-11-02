'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { User } from 'lucide-react';

type SessionState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | {
      status: 'authenticated';
      user: { id: string; email: string; name: string; phone: string; roles: string[] };
      isStaff: boolean;
    };

interface AccountWidgetProps {
  isActive?: boolean;
  className?: string;
}
const UserIcon = User;
const AccountWidget = React.forwardRef<HTMLAnchorElement, AccountWidgetProps>(
  ({ isActive = false, className }, ref) => {
    const [session, setSession] = useState<SessionState>({ status: 'loading' });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

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
            user?: { id: string; email?: string; name?: string; phone?: string; roles?: unknown };
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
                name: data.user.name ?? '',
                phone: data.user.phone ?? '',
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

    let accountHref = '/account';

    if (session.status === 'authenticated') {
      if (session.isStaff) {
        const roles = session.user.roles ?? [];
        const hasDoctor = roles.includes('doctor');
        const hasReceptionist = roles.includes('receptionist');
        const isAdmin = roles.includes('admin');

        if (hasDoctor && !hasReceptionist && !isAdmin) {
          accountHref = '/staff/doctor';
        } else if (hasReceptionist || isAdmin) {
          accountHref = '/staff/receptionist';
        } else {
          accountHref = '/staff';
        }
      } else {
        accountHref = '/account';
      }
    }

    const buttonClassName = clsx(
      'group relative flex h-[40px] w-[48px] items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white text-foreground  backdrop-blur-xl transition-all shadow-sm duration-300 ease-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-black/80',
      className,
    );

    if (!mounted) {
      return (
        <button aria-label="حساب کاربری" className={buttonClassName} type="button" disabled>
          <span className="sr-only">حساب کاربری</span>
          <span aria-hidden="true" className="flex items-center justify-center">
            <UserIcon className="h-5 w-5" aria-hidden="true" />
          </span>
        </button>
      );
    }

    if (session.status === 'loading') {
      return (
        <button aria-label="حساب کاربری" className={buttonClassName} type="button" disabled>
          <span className="sr-only">حساب کاربری</span>
          <span aria-hidden="true" className="flex items-center justify-center animate-pulse">
            <UserIcon className="h-5 w-5" aria-hidden="true" />
          </span>
        </button>
      );
    }

    if (session.status === 'unauthenticated') {
      return (
        <Link href="/login" className={buttonClassName} aria-label="ورود یا ثبت‌نام">
          <span className="sr-only">ورود یا ثبت‌نام</span>
          <span aria-hidden="true" className="flex items-center justify-center">
            <UserIcon className="h-5 w-5" aria-hidden="true" />
          </span>
        </Link>
      );
    }

    return (
      <Link
        ref={ref}
        href={accountHref}
        className={buttonClassName}
        aria-label={`حساب کاربری - ${session.user.email}`}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="sr-only">حساب کاربری</span>
        <span aria-hidden="true" className="flex items-center justify-center">
          <UserIcon className="h-5 w-5" aria-hidden="true" />
        </span>
      </Link>
    );
  },
);

AccountWidget.displayName = 'AccountWidget';

export default AccountWidget;
