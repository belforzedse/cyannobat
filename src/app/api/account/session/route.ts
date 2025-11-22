import { NextResponse } from 'next/server';
import { authenticateStrapiRequest, extractStrapiRoles, userIsStrapiStaff } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export const GET = async (request: Request) => {
  let authUser = null;

  try {
    const authResult = await authenticateStrapiRequest(request);
    authUser = authResult.user;
  } catch (error) {
    console.warn('Failed to resolve account session', error);
  }

  if (!authUser) {
    return NextResponse.json({ authenticated: false });
  }

  const roles = extractStrapiRoles(authUser);

  return NextResponse.json({
    authenticated: true,
    user: {
      id: String(authUser.id),
      email: authUser.email ?? '',
      name: authUser.name ?? '',
      phone: authUser.phone ?? '',
      roles,
    },
    isStaff: userIsStrapiStaff(authUser),
  });
};
