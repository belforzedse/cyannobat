import { NextResponse } from 'next/server';
import { authenticateStrapiRequest, userIsStrapiStaff, type StrapiUser } from '@/lib/strapi';

type StaffAuthResult =
  | {
      user: StrapiUser;
    }
  | {
      user: null;
    };

export const authenticateStaffRequest = async (request: Request): Promise<StaffAuthResult> => {
  const authResult = await authenticateStrapiRequest(request);
  const user = authResult.user;

  if (!user || !userIsStrapiStaff(user)) {
    return { user: null };
  }

  return { user };
};

export const unauthorizedResponse = () =>
  NextResponse.json(
    {
      message: 'Unauthorized',
    },
    { status: 401 },
  );
