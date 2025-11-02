import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { getPayload } from 'payload';

import configPromise from '@payload-config';
import { Button } from '@/components/ui/Button';
import type { Appointment, Provider as ProviderDoc, Service } from '@/payload-types';

export const dynamic = 'force-dynamic';

type ConfirmationSearchParams = {
  reference?: string | string[] | undefined;
};

type ConfirmationPageProps = {
  searchParams?: Promise<ConfirmationSearchParams>;
};

type PopulatedAppointment = Appointment & {
  provider?: Appointment['provider'];
  service?: Appointment['service'];
};

const statusLabels: Record<string, string> = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  cancelled: 'لغو شده',
  completed: 'انجام شده',
};

const getRelationDoc = <T,>(relation: unknown): T | null => {
  if (!relation || typeof relation === 'string' || typeof relation === 'number') {
    return null;
  }

  if (typeof relation === 'object') {
    const candidate = relation as { value?: unknown };
    if ('value' in candidate) {
      const value = candidate.value;
      return value && typeof value === 'object' ? (value as T) : null;
    }

    return relation as T;
  }

  return null;
};

const sortByNewest = <T extends { createdAt?: string | Date | null }>(docs: T[]): T[] => {
  return [...docs].sort((a, b) => {
    const first = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const second = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return second - first;
  });
};

const formatDateTime = (iso: string | null | undefined, timeZone: string | null | undefined) => {
  if (!iso) {
    return 'زمان نامشخص';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'زمان نامشخص';
  }

  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: timeZone && timeZone.trim() !== '' ? timeZone : 'UTC',
    }).format(date);
  } catch {
    return 'زمان نامشخص';
  }
};

const MissingReferenceNotice = () => {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-white/20 bg-white/80 p-10 text-right shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
        تأییدیه رزرو در دسترس نیست
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
        برای مشاهده جزئیات نوبت به کد پیگیری نیاز داریم. لطفاً از صفحه رزرو وارد شوید یا حساب کاربری
        خود را بررسی کنید.
      </p>
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Link href="/reserve">
          <Button variant="secondary" size="sm" className="px-5 py-2 text-sm">
            شروع رزرو جدید
          </Button>
        </Link>
        <Link href="/account">
          <Button variant="primary" size="sm" className="px-5 py-2 text-sm">
            مشاهده حساب کاربری
          </Button>
        </Link>
      </div>
    </section>
  );
};

const MissingAppointmentNotice = ({ reference }: { reference: string }) => {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-white/20 bg-white/80 p-10 text-right shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
        رزروی با این کد پیدا نشد
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
        کد پیگیری <span className="font-semibold text-slate-900 dark:text-white">{reference}</span>{' '}
        در سابقه نوبت‌های شما یافت نشد. ممکن است رزرو هنوز ثبت نشده یا با حساب دیگری ایجاد شده باشد.
      </p>
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Link href="/reserve">
          <Button variant="secondary" size="sm" className="px-5 py-2 text-sm">
            بازگشت به رزرو
          </Button>
        </Link>
        <Link href="/account">
          <Button variant="primary" size="sm" className="px-5 py-2 text-sm">
            مراجعه به حساب کاربری
          </Button>
        </Link>
      </div>
    </section>
  );
};

const ConfirmationPage = async ({ searchParams }: ConfirmationPageProps) => {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const referenceParam = resolvedSearchParams?.reference;
  const reference = Array.isArray(referenceParam)
    ? (referenceParam[0] ?? null)
    : (referenceParam ?? null);

  if (!reference) {
    return <MissingReferenceNotice />;
  }

  const payload = await getPayload({
    config: configPromise,
  });

  const headerStore = await headers();

  const authResult = await payload
    .auth({
      headers: headerStore,
    })
    .catch(() => ({ user: null }));

  const authUser = authResult?.user;

  if (!authUser) {
    redirect('/login');
  }

  const userId = String((authUser as { id?: string | number }).id ?? '');

  const appointmentsByReference = await payload.find({
    collection: 'appointments',
    where: {
      and: [
        {
          client: {
            equals: userId,
          },
        },
        {
          reference: {
            equals: reference,
          },
        },
      ],
    },
    limit: 5,
    depth: 2,
    sort: 'createdAt',
    overrideAccess: true,
  });

  let appointment = sortByNewest(appointmentsByReference.docs as PopulatedAppointment[])[0];

  if (!appointment) {
    const latestAppointments = await payload.find({
      collection: 'appointments',
      where: {
        client: {
          equals: userId,
        },
      },
      limit: 5,
      depth: 2,
      sort: 'createdAt',
      overrideAccess: true,
    });

    appointment = sortByNewest(latestAppointments.docs as PopulatedAppointment[])[0];
  }

  if (!appointment) {
    return <MissingAppointmentNotice reference={reference} />;
  }

  const schedule = appointment.schedule ?? {};
  const provider = getRelationDoc<ProviderDoc>(appointment.provider);
  const service = getRelationDoc<Service>(appointment.service);
  const serviceTitle = service?.title ?? 'خدمت انتخاب‌شده';
  const providerName = provider?.displayName ?? 'پزشک اعلام خواهد شد';
  const timeZone = schedule?.timeZone ?? 'UTC';
  const appointmentDateTime = formatDateTime(schedule?.start ?? null, timeZone);
  const status = appointment.status ?? 'pending';
  const statusLabel = statusLabels[status] ?? 'وضعیت نامشخص';

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 rounded-3xl border border-white/20 bg-white/80 p-10 text-right shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center justify-center rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
          رزرو موفق
        </span>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">نوبت شما ثبت شد</h1>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
          با کد پیگیری{' '}
          <span className="font-semibold text-slate-900 dark:text-white">
            {appointment.reference ?? reference}
          </span>{' '}
          می‌توانید وضعیت رزرو را در حساب کاربری خود پیگیری کنید. جزئیات زیر برای شما ارسال شده است.
        </p>
      </div>

      <dl className="grid gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            خدمت انتخابی
          </dt>
          <dd className="text-base font-semibold text-slate-900 dark:text-white">{serviceTitle}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            پزشک
          </dt>
          <dd className="text-base font-semibold text-slate-900 dark:text-white">{providerName}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            زمان نوبت
          </dt>
          <dd className="text-base font-semibold text-slate-900 dark:text-white">
            {appointmentDateTime}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            وضعیت فعلی
          </dt>
          <dd className="text-base font-semibold text-slate-900 dark:text-white">{statusLabel}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap justify-end gap-3">
        <Link href="/reserve">
          <Button variant="secondary" size="sm" className="px-5 py-2 text-sm">
            رزرو نوبت جدید
          </Button>
        </Link>
        <Link href="/account">
          <Button variant="primary" size="sm" className="px-5 py-2 text-sm">
            مشاهده نوبت‌ها در حساب
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default ConfirmationPage;
