import { NextResponse } from 'next/server';
import { strapi, extractStrapiRoles, userIsStrapiStaff, type StrapiUser } from '@/lib/strapi';
import {
  isValidIranNationalId,
  normalizeIranNationalIdDigits,
} from '@/lib/validators/iran-national-id';

const iranPhoneRegex = /^(\+98|0)?9\d{9}$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const parseBody = async (
  request: Request,
): Promise<
  | {
      name: string;
      phone: string;
      password: string;
      nationalId: string;
      email?: string;
    }
  | NextResponse
> => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { message: 'Name, phone, and password are required' },
      { status: 400 },
    );
  }

  const { name, phone, password, nationalId, email } = body as {
    name?: unknown;
    phone?: unknown;
    password?: unknown;
    nationalId?: unknown;
    email?: unknown;
  };

  if (
    typeof name !== 'string' ||
    typeof phone !== 'string' ||
    typeof password !== 'string' ||
    typeof nationalId !== 'string'
  ) {
    return NextResponse.json(
      { message: 'Name, phone, national ID, and password are required' },
      { status: 400 },
    );
  }

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const normalizedNationalId = normalizeIranNationalIdDigits(nationalId);
  const trimmedNationalId = normalizedNationalId.trim();
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : undefined;

  if (!trimmedName) {
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });
  }

  if (!iranPhoneRegex.test(trimmedPhone)) {
    return NextResponse.json({ message: 'Enter a valid Iranian phone number' }, { status: 400 });
  }

  if (!isValidIranNationalId(trimmedNationalId)) {
    return NextResponse.json({ message: 'Enter a valid Iranian national ID' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: 'Password must be at least 8 characters long' },
      { status: 400 },
    );
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !trimmedEmail) {
      return NextResponse.json({ message: 'Email must be a valid string' }, { status: 400 });
    }

    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ message: 'Enter a valid email address' }, { status: 400 });
    }
  }

  return {
    name: trimmedName,
    phone: trimmedPhone,
    password,
    nationalId: trimmedNationalId,
    email: trimmedEmail,
  };
};

const setAuthCookies = (response: NextResponse, jwt: string) => {
  const secureCookies = process.env.NODE_ENV === 'production';
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  response.cookies.set('jwt', jwt, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookies,
    expires,
  });
};

export const dynamic = 'force-dynamic';

export const POST = async (request: Request) => {
  const parsed = await parseBody(request);

  if (parsed instanceof NextResponse) {
    return parsed;
  }

  const { name, phone, password, nationalId, email } = parsed;

  try {
    // Check for existing user by phone
    const existing = await strapi.find<StrapiUser>('users', {
      filters: {
        phone: {
          $eq: phone,
        },
      },
      pagination: {
        limit: 1,
      },
    });

    if (existing.data.length > 0) {
      return NextResponse.json(
        { message: 'A user with that phone already exists' },
        { status: 409 },
      );
    }
  } catch (error) {
    console.error('Failed to check for existing user by phone', error);
    return NextResponse.json(
      { message: 'Unable to process signup request at this time.' },
      { status: 500 },
    );
  }

  try {
    // Check for existing user by national ID
    const existingByNationalId = await strapi.find<StrapiUser>('users', {
      filters: {
        nationalId: {
          $eq: nationalId,
        },
      },
      pagination: {
        limit: 1,
      },
    });

    if (existingByNationalId.data.length > 0) {
      return NextResponse.json(
        { message: 'A user with that national ID already exists' },
        { status: 409 },
      );
    }
  } catch (error) {
    console.error('Failed to check for existing user by national ID', error);
    return NextResponse.json(
      { message: 'Unable to process signup request at this time.' },
      { status: 500 },
    );
  }

  let authResult;

  try {
    // Strapi register creates user and returns JWT + user
    // Use phone as username, email if provided
    authResult = await strapi.register(
      phone, // username
      email ?? `${phone}@temp.local`, // email (required by Strapi)
      password,
      {
        name,
        phone,
        nationalId,
        // Note: roles assignment may need to be done via Strapi admin API
        // or configured in Strapi's user-permissions plugin
      },
    );
  } catch (error) {
    console.error('Failed to create user during signup', error);

    if (error instanceof Error && /duplicate|already exists/i.test(error.message)) {
      return NextResponse.json(
        { message: 'A user with that phone already exists' },
        { status: 409 },
      );
    }

    return NextResponse.json({ message: 'Failed to create user account.' }, { status: 500 });
  }

  if (!authResult.user) {
    return NextResponse.json({ message: 'Failed to authenticate new user.' }, { status: 500 });
  }

  // Fetch full user with populated role
  const authUser = await strapi.findByID<StrapiUser>('users', authResult.user.id, {
    populate: ['role'],
  });

  const roles = extractStrapiRoles(authUser);

  const response = NextResponse.json({
    user: {
      id: String(authUser.id),
      name: authUser.name ?? '',
      phone: authUser.phone ?? '',
      roles,
    },
    isStaff: userIsStrapiStaff(authUser),
  });

  if (authResult.jwt) {
    setAuthCookies(response, authResult.jwt);
  }

  return response;
};
