import { NextResponse } from 'next/server'
import { getPayload, type PayloadRequest } from 'payload'

import configPromise from '@payload-config'
import { extractRoles, userIsStaff } from '@/lib/auth'

type StaffLoginResult = {
  user: PayloadRequest['user'] | null
  token?: string
  exp?: number
  refreshToken?: string
  refreshTokenExpiration?: number
}

export const dynamic = 'force-dynamic'

export const POST = async (request: Request) => {
  const payload = await getPayload({ config: configPromise })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  if (
    !body ||
    typeof body !== 'object' ||
    typeof (body as { email?: unknown }).email !== 'string' ||
    typeof (body as { password?: unknown }).password !== 'string'
  ) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
  }

  const { email, password } = body as { email: string; password: string }

  try {
    const auth = (await payload.login({
      collection: 'users',
      data: { email, password },
    })) as StaffLoginResult

    const authUser = auth.user as PayloadRequest['user']

    if (!authUser) {
      return NextResponse.json({ message: 'ورود ناموفق بود. ایمیل یا رمز عبور را بررسی کنید.' }, { status: 401 })
    }

    const roles = extractRoles(authUser)

    const response = NextResponse.json({
      user: { id: String(authUser.id), email: authUser.email ?? '', roles },
      isStaff: userIsStaff(authUser),
    })

    const secureCookies = process.env.NODE_ENV === 'production'

    if (auth.token) {
      response.cookies.set('payload-token', auth.token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: secureCookies,
        ...(auth.exp ? { expires: new Date(auth.exp * 1000) } : {}),
      })
    }

    if (auth.refreshToken) {
      const rtExp = auth.refreshTokenExpiration ?? undefined
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
      })
    }

    return response
  } catch (error) {
    payload.logger.warn?.('Failed login attempt', error)
    return NextResponse.json(
      { message: 'ورود ناموفق بود. ایمیل یا رمز عبور را بررسی کنید.' },
      { status: 401 },
    )
  }
}
