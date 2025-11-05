import { sql } from 'drizzle-orm';

import configPromise, { payloadDrizzle } from '@payload-config';

export type DateRangeFilters = {
  from?: Date;
  to?: Date;
};

export type ProviderScopedFilters = DateRangeFilters & {
  providerIds?: Array<string | number>;
};

export type VisitsAnalytics = {
  totalVisits: number;
  upcomingVisits: number;
  completedVisits: number;
  cancelledVisits: number;
};

export type RevenueAnalytics = {
  totalRevenue: number;
  currency: string;
};

export type SatisfactionAnalytics = {
  averageScore: number | null;
  responseCount: number;
};

const isDatabaseAvailable = (): boolean => typeof payloadDrizzle.execute === 'function';

const extractRows = <T>(result: unknown): T[] => {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && Array.isArray((result as { rows?: unknown }).rows)) {
    return (result as { rows: T[] }).rows;
  }
  return [];
};

const normalizeIds = (ids?: Array<string | number>): string[] =>
  Array.isArray(ids) ? ids.map((id) => String(id)) : [];

const buildDateClause = (filters?: DateRangeFilters) => {
  if (!filters?.from && !filters?.to) return sql``;
  if (filters.from && filters.to) {
    return sql`AND appointments.schedule_start BETWEEN ${filters.from.toISOString()} AND ${filters.to.toISOString()}`;
  }
  if (filters.from) {
    return sql`AND appointments.schedule_start >= ${filters.from.toISOString()}`;
  }
  if (filters.to) {
    return sql`AND appointments.schedule_start <= ${filters.to.toISOString()}`;
  }
  return sql``;
};

const buildProviderClause = (providerIds?: Array<string | number>) => {
  const ids = normalizeIds(providerIds);
  if (ids.length === 0) return sql``;
  return sql`AND appointments.provider_id = ANY(${ids})`;
};

export const getVisitAnalytics = async (filters: ProviderScopedFilters = {}): Promise<VisitsAnalytics> => {
  if (!isDatabaseAvailable()) {
    return {
      totalVisits: 0,
      upcomingVisits: 0,
      completedVisits: 0,
      cancelledVisits: 0,
    };
  }

  const providerClause = buildProviderClause(filters.providerIds);
  const dateClause = buildDateClause(filters);

  const result = await payloadDrizzle.execute(sql`
    SELECT appointments.status as status, COUNT(*)::text as count
    FROM appointments
    WHERE 1=1
    ${providerClause}
    ${dateClause}
    GROUP BY appointments.status
  `);

  const rows = extractRows<{
    status: string;
    count: string;
  }>(result);

  const base: VisitsAnalytics = {
    totalVisits: 0,
    upcomingVisits: 0,
    completedVisits: 0,
    cancelledVisits: 0,
  };

  for (const row of rows) {
    const count = Number(row.count ?? 0);
    base.totalVisits += count;
    switch (row.status) {
      case 'confirmed':
      case 'pending':
      case 'in_progress': {
        base.upcomingVisits += count;
        break;
      }
      case 'completed': {
        base.completedVisits += count;
        break;
      }
      case 'cancelled':
      case 'no_show': {
        base.cancelledVisits += count;
        break;
      }
      default:
        break;
    }
  }

  return base;
};

export const getRevenueAnalytics = async (
  filters: ProviderScopedFilters = {},
): Promise<RevenueAnalytics> => {
  if (!isDatabaseAvailable()) {
    return { totalRevenue: 0, currency: 'USD' };
  }

  const providerClause = buildProviderClause(filters.providerIds);
  const dateClause = buildDateClause(filters);

  const revenueResult = await payloadDrizzle.execute(sql`
    SELECT COALESCE(SUM(appointments.pricing_snapshot_amount), 0)::text AS total,
           MAX(appointments.pricing_snapshot_currency) AS currency
    FROM appointments
    WHERE appointments.status = 'completed'
    ${providerClause}
    ${dateClause}
  `);

  const [row] = extractRows<{ total: string | null; currency: string | null }>(revenueResult);

  return {
    totalRevenue: Number(row?.total ?? 0),
    currency: row?.currency ?? 'USD',
  };
};

export const getSatisfactionAnalytics = async (
  filters: ProviderScopedFilters = {},
): Promise<SatisfactionAnalytics> => {
  if (!isDatabaseAvailable()) {
    return { averageScore: null, responseCount: 0 };
  }

  const providerClause = buildProviderClause(filters.providerIds);
  const dateClause = buildDateClause(filters);

  const satisfactionResult = await payloadDrizzle.execute(sql`
    SELECT AVG(appointments.patient_feedback_score)::text AS avg,
           COUNT(appointments.patient_feedback_score)::text AS count
    FROM appointments
    WHERE appointments.patient_feedback_score IS NOT NULL
    ${providerClause}
    ${dateClause}
  `);

  const [row] = extractRows<{ avg: string | null; count: string | null }>(satisfactionResult);

  return {
    averageScore: row?.avg ? Number(row.avg) : null,
    responseCount: row?.count ? Number(row.count) : 0,
  };
};

export const ensureAnalyticsPrerequisites = async () => {
  await configPromise;
};
