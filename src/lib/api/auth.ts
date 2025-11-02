import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import type { Payload } from 'payload';

import configPromise from '@payload-config';
import { userIsStaff } from '@/lib/auth';

type StaffAuthResult =
  | {
      payload: Payload;
      user: NonNullable<Awaited<ReturnType<Payload['auth']>>['user']>;
    }
  | {
      payload: Payload;
      user: null;
    };

export const authenticateStaffRequest = async (request: Request): Promise<StaffAuthResult> => {
  const payload = await getPayload({
    config: configPromise,
  });

  let user: Awaited<ReturnType<Payload['auth']>>['user'] = null;

  try {
    const authResult = await payload.auth({
      headers: request.headers,
    });
    user = authResult?.user ?? null;
  } catch (error) {
    payload.logger.warn?.('Failed to authenticate request', error);
  }

  if (!user || !userIsStaff(user)) {
    return { payload, user: null };
  }

  return { payload, user };
};

export const unauthorizedResponse = () =>
  NextResponse.json(
    {
      message: 'Unauthorized',
    },
    { status: 401 },
  );
