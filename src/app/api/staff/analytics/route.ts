import { NextResponse } from 'next/server';
import { z } from 'zod';

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth';
import {
  getRevenueAnalytics,
  getSatisfactionAnalytics,
  getVisitAnalytics,
} from '@/lib/staff/server/analytics';

export const dynamic = 'force-dynamic';

const graphqlSchema = z.object({
  query: z.string().min(1),
  variables: z.record(z.unknown()).optional(),
});

const buildProviderFilter = (providerParam: string | null) => {
  if (!providerParam) return undefined;
  const normalized = providerParam.split(',').map((value) => value.trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : undefined;
};

export const GET = async (request: Request) => {
  const { user } = await authenticateStaffRequest(request);
  if (!user) return unauthorizedResponse();

  const url = new URL(request.url);
  const providerParam = url.searchParams.get('providerId');
  const providerIds = buildProviderFilter(providerParam);

  const [visits, revenue, satisfaction] = await Promise.all([
    getVisitAnalytics({ providerIds }),
    getRevenueAnalytics({ providerIds }),
    getSatisfactionAnalytics({ providerIds }),
  ]);

  return NextResponse.json({ visits, revenue, satisfaction });
};

const respondGraphQL = async (query: string, providerIds?: string[]) => {
  const lowered = query.toLowerCase();
  const response: Record<string, unknown> = {};

  if (lowered.includes('visits')) {
    response.visits = await getVisitAnalytics({ providerIds });
  }
  if (lowered.includes('revenue')) {
    response.revenue = await getRevenueAnalytics({ providerIds });
  }
  if (lowered.includes('satisfaction')) {
    response.satisfaction = await getSatisfactionAnalytics({ providerIds });
  }

  return response;
};

export const POST = async (request: Request) => {
  const { user } = await authenticateStaffRequest(request);
  if (!user) return unauthorizedResponse();

  const json = await request.json().catch(() => null);
  const parsed = graphqlSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Invalid request',
        errors: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const { query, variables } = parsed.data;
  const providerIds = buildProviderFilter((variables?.providerIds as string | undefined) ?? null);

  const data = await respondGraphQL(query, providerIds);

  return NextResponse.json({ data });
};
