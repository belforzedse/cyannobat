import { NextResponse } from 'next/server';
import { getPayload, type PayloadRequest } from 'payload';

import configPromise from '@payload-config';
import { extractRoles, userIsStaff } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = async (request: Request) => {
  const payload = await getPayload({
    config: configPromise,
  });

  let authUser: PayloadRequest['user'] | null = null;

  try {
    const authResult = await payload.auth({
      headers: request.headers,
    });

    authUser = (authResult?.user ?? null) as PayloadRequest['user'] | null;
  } catch (error) {
    payload.logger.warn?.('Failed to resolve account session', error);
  }

  if (!authUser) {
    return NextResponse.json({ authenticated: false });
  }

  const roles = extractRoles(authUser);

  return NextResponse.json({
    authenticated: true,
    user: {
      id: String(authUser.id),
      email: authUser.email ?? '',
      roles,
    },
    isStaff: userIsStaff(authUser),
  });
};
