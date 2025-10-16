import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const payload = await getPayload({ config: configPromise });

  return NextResponse.json({
    status: 'ready',
    project: 'cyannobat',
    payloadVersion: payload?.config?.admin?.version ?? 'unknown',
  });
}

export async function POST(request: Request) {
  await getPayload({ config: configPromise });
  const body = await request.json().catch(() => ({}));
  const { collection, operation } = body as { collection?: string; operation?: string };

  return NextResponse.json({
    status: 'acknowledged',
    collection: collection ?? null,
    operation: operation ?? 'noop',
    timestamp: new Date().toISOString(),
  });
}
