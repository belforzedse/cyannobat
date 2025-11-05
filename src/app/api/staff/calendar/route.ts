import { NextResponse } from 'next/server';
import type { Where } from 'payload';

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth';
import { extractRoles } from '@/lib/auth';
import { getProviderIdsForUser, shouldFilterAppointmentsForRoles } from '@/lib/staff/server/loadStaffData';

export const dynamic = 'force-dynamic';

const CALENDAR_WINDOWS: Record<'weekly' | 'monthly', number> = {
  weekly: 7,
  monthly: 31,
};

const buildScheduleFilter = (view: 'weekly' | 'monthly'): Where => {
  const now = new Date();
  const end = new Date(now.getTime());
  const days = CALENDAR_WINDOWS[view];
  end.setDate(end.getDate() + days);

  return {
    and: [
      {
        'schedule.start': {
          greater_than_equal: now.toISOString(),
        },
      },
      {
        'schedule.start': {
          less_than_equal: end.toISOString(),
        },
      },
    ],
  } as Where;
};

const mapEvent = (record: Record<string, unknown>) => {
  const schedule = (record.schedule as Record<string, string | null | undefined>) ?? {};
  const provider = record.provider as Record<string, unknown> | null;
  const client = record.client as Record<string, unknown> | null;

  return {
    id: String(record.id ?? ''),
    title: typeof record.service === 'object' && record.service !== null
      ? ((record.service as Record<string, unknown>).title as string | undefined) ?? 'نوبت'
      : (record.serviceTitle as string | undefined) ?? 'نوبت',
    start: (schedule.start as string | undefined) ?? '',
    end: (schedule.end as string | undefined) ?? '',
    providerName: provider && typeof provider === 'object'
      ? ((provider.displayName as string | undefined) ?? null)
      : null,
    patientName: client && typeof client === 'object' ? ((client.name as string | undefined) ?? null) : null,
  };
};

export const GET = async (request: Request) => {
  const { payload, user } = await authenticateStaffRequest(request);
  if (!user) return unauthorizedResponse();

  const url = new URL(request.url);
  const viewParam = url.searchParams.get('view');
  const providerParam = url.searchParams.get('providerId');
  const view = viewParam === 'monthly' ? 'monthly' : 'weekly';

  const scheduleFilter = buildScheduleFilter(view);
  const filters: Where[] = [scheduleFilter];

  const roles = extractRoles(user);
  const enforceProviderFilter = shouldFilterAppointmentsForRoles(roles);

  if (providerParam) {
    filters.push({
      provider: {
        equals: providerParam,
      },
    } as Where);
  } else if (enforceProviderFilter) {
    const providerIds = await getProviderIdsForUser(payload, user);
    if (providerIds.length > 0) {
      filters.push({
        provider: {
          in: providerIds,
        },
      } as Where);
    }
  }

  const where: Where = filters.length === 1 ? filters[0] : ({ and: filters } as Where);

  const result = await payload.find({
    collection: 'appointments',
    where,
    limit: 100,
    depth: 2,
    overrideAccess: false,
  });

  const events = result.docs.map((doc) => mapEvent(doc as Record<string, unknown>));

  return NextResponse.json({ events });
};
