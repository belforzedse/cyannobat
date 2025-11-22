/**
 * Strapi authentication helpers
 * 
 * Replaces Payload's auth() method with Strapi JWT-based authentication
 */

import { cookies, headers } from 'next/headers';
import { strapi, getStrapiTokenFromRequest, type StrapiUser } from './client';

export interface StrapiAuthResult {
  user: StrapiUser | null;
  token?: string;
}

/**
 * Authenticate request using Strapi JWT token
 * Works with both Request objects and Next.js headers()
 */
export async function authenticateStrapiRequest(
  requestOrHeaders?: Request | Awaited<ReturnType<typeof headers>>,
): Promise<StrapiAuthResult> {
  let token: string | null = null;

  if (requestOrHeaders instanceof Request) {
    token = getStrapiTokenFromRequest(requestOrHeaders);
  } else {
    // Next.js headers() case - check cookies
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('jwt')?.value || cookieStore.get('strapi-jwt')?.value || null;
    } catch {
      // If cookies() fails, try to get from headers
      const headersList = requestOrHeaders || (await headers());
      const cookieHeader = headersList.get('cookie');
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split('; ').map((c) => {
            const [key, ...rest] = c.split('=');
            return [key, rest.join('=')];
          }),
        );
        token = cookies.jwt || cookies['strapi-jwt'] || null;
      }
    }
  }

  if (!token) {
    return { user: null };
  }

  try {
    const user = await strapi.getMe(token);
    return { user, token };
  } catch (error) {
    console.warn('Failed to authenticate Strapi request', error);
    return { user: null };
  }
}

/**
 * Extract roles from Strapi user
 * Strapi roles can be in different formats depending on populate
 */
export function extractStrapiRoles(user: StrapiUser | null | undefined): string[] {
  if (!user) return [];
  
  // Check if roles is an array of strings
  if (Array.isArray(user.roles)) {
    return user.roles
      .map((role) => (typeof role === 'string' ? role : role?.name))
      .filter((role): role is string => typeof role === 'string');
  }

  // Check if role is a single object
  if (user.role && typeof user.role === 'object' && 'name' in user.role) {
    return [user.role.name as string];
  }

  return [];
}

/**
 * Check if user has a specific role
 */
export function userHasStrapiRole(
  user: StrapiUser | null | undefined,
  role: string,
): boolean {
  return extractStrapiRoles(user).includes(role);
}

/**
 * Check if user is admin
 */
export function userIsStrapiAdmin(user: StrapiUser | null | undefined): boolean {
  return userHasStrapiRole(user, 'admin');
}

/**
 * Check if user is staff (admin, doctor, or receptionist)
 */
export function userIsStrapiStaff(user: StrapiUser | null | undefined): boolean {
  if (!user) return false;
  const roles = extractStrapiRoles(user);
  return roles.includes('admin') || roles.includes('doctor') || roles.includes('receptionist');
}
