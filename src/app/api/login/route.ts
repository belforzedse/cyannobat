import { NextResponse } from 'next/server';
import { strapi } from '@/lib/strapi';
import { extractStrapiRoles, userIsStrapiStaff, type StrapiUser } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export const POST = async (request: Request) => {
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
    // Strapi accepts identifier (email or username) and password
    const auth = await strapi.login(trimmedIdentifier, password);

    if (!auth.user) {
      return NextResponse.json(
        { message: 'ورود ناموفق بود. ایمیل یا شماره تلفن یا رمز عبور را بررسی کنید.' },
        { status: 401 },
      );
    }

    // Fetch full user with populated role
    const authUser = await strapi.findByID<StrapiUser>('users', auth.user.id, {
      populate: ['role'],
    });

    const roles = extractStrapiRoles(authUser);

    const response = NextResponse.json({
      user: { id: String(authUser.id), email: authUser.email ?? '', roles },
      isStaff: userIsStrapiStaff(authUser),
    });

    const secureCookies = process.env.NODE_ENV === 'production';

    if (auth.jwt) {
      // Strapi JWT doesn't have explicit expiration in the response,
      // but typically expires in 7 days. We'll set a reasonable expiration.
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      response.cookies.set('jwt', auth.jwt, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: secureCookies,
        expires,
      });
    }

    return response;
  } catch (error) {
    console.warn('Failed login attempt', error);
    return NextResponse.json(
      { message: 'ورود ناموفق بود. ایمیل یا شماره تلفن یا رمز عبور را بررسی کنید.' },
      { status: 401 },
    );
  }
};
