import { NextResponse } from 'next/server'

import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { userIsStaff } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const POST = async (request: Request) => {
  const payload = await getPayload({
    config: configPromise,
  })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      {
        message: 'Invalid JSON body',
      },
      { status: 400 },
    )
  }

  if (
    !body ||
    typeof body !== 'object' ||
    typeof (body as { email?: unknown }).email !== 'string' ||
    typeof (body as { password?: unknown }).password !== 'string'
  ) {
    return NextResponse.json(
      {
        message: 'Email and password are required',
      },
      { status: 400 },
    )
  }

  const email = (body as { email: string }).email
  const password = (body as { password: string }).password

  try {
    const auth = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    if (!auth.user || !userIsStaff(auth.user)) {
      return NextResponse.json(
        {
          message: 'حساب کاربری مجاز نیست.',
        },
        { status: 403 },
      )
    }

    const response = NextResponse.json({
      user: {
        id: auth.user.id,
        email: auth.user.email,
        roles: auth.user.roles ?? [],
      },
    })

    const refreshTokenCookieOptions = auth.ref?.exp
      ? {
          path: '/',
          httpOnly: true,
          sameSite: 'lax' as const,
          secure: true,
          expires: new Date(auth.ref.exp * 1000),
        }
      : {
          path: '/',
          httpOnly: true,
          sameSite: 'lax' as const,
          secure: true,
        }

    response.cookies.set('payload-token', auth.token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    })
    response.cookies.set('payload-refresh-token', auth.ref?.token ?? '', refreshTokenCookieOptions)

    return response
  } catch (error) {
    payload.logger.warn?.('Failed staff login attempt', error)
    return NextResponse.json(
      {
        message: 'نام کاربری یا رمز عبور اشتباه است.',
      },
      { status: 401 },
    )
  }
}

