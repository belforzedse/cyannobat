import { NextResponse } from 'next/server';
import { getPayload, type PayloadRequest } from 'payload';

import configPromise from '@payload-config';
import { extractRoles, userIsStaff } from '@/lib/auth';

type StaffLoginResult = {
  user: PayloadRequest['user'] | null;
  token?: string;
  exp?: number;
  refreshToken?: string;
  refreshTokenExpiration?: number;
};

export const dynamic = 'force-dynamic';

export const POST = async (request: Request) => {
  const payload = await getPayload({ config: configPromise });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== 'object' ||
    typeof (body as { identifier?: unknown }).identifier !== 'string' ||
    typeof (body as { password?: unknown }).password !== 'string'
  ) {
    return NextResponse.json(
      { message: 'ایمیل یا شماره تلفن و رمز عبور الزامی است.' },
      { status: 400 },
    );
  }

  const { identifier, password } = body as { identifier: string; password: string };
  const trimmedIdentifier = identifier.trim();

  if (!trimmedIdentifier) {
    return NextResponse.json(
      { message: 'ایمیل یا شماره تلفن و رمز عبور الزامی است.' },
      { status: 400 },
    );
  }

  try {
    const loginData: { email: string; username?: string; password: string } =
      trimmedIdentifier.includes('@')
        ? { email: trimmedIdentifier, password }
        : { email: trimmedIdentifier, username: trimmedIdentifier, password };

    const auth = (await payload.login({
      collection: 'users',
      data: loginData,
    })) as StaffLoginResult;

    let authUser = auth.user as PayloadRequest['user'];

    if (!authUser) {
      return NextResponse.json(
        { message: 'ورود ناموفق بود. ایمیل یا شماره تلفن یا رمز عبور را بررسی کنید.' },
        { status: 401 },
      );
    }

    // Ensure roles are loaded (depth=1 to get the full user object with all fields)
    authUser = (await payload.findByID({
      collection: 'users',
      id: String(authUser.id),
      depth: 0,
    })) as PayloadRequest['user'];

    const roles = extractRoles(authUser);

    const response = NextResponse.json({
      user: { id: String(authUser.id), email: authUser.email ?? '', roles },
      isStaff: userIsStaff(authUser),
    });

    const secureCookies = process.env.NODE_ENV === 'production';

    if (auth.token) {
      response.cookies.set('payload-token', auth.token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: secureCookies,
        ...(auth.exp ? { expires: new Date(auth.exp * 1000) } : {}),
      });
    }

    if (auth.refreshToken) {
      const rtExp = auth.refreshTokenExpiration ?? undefined;
      response.cookies.set('payload-refresh-token', auth.refreshToken, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: secureCookies,
        ...(rtExp
          ? {
              expires: new Date(rtExp > 1_000_000_000_000 ? rtExp : rtExp * 1000),
            }
          : {}),
      });
    }

    return response;
  } catch (error) {
    payload.logger.warn?.('Failed login attempt', error);
    return NextResponse.json(
      { message: 'ورود ناموفق بود. ایمیل یا شماره تلفن یا رمز عبور را بررسی کنید.' },
      { status: 401 },
    );
  }
};
