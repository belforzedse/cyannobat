import { NextResponse } from 'next/server'
import { getPayload, type PayloadRequest } from 'payload'

import configPromise from '@payload-config'
import { extractRoles, userIsStaff } from '@/lib/auth'

type AuthResult = {
  user: PayloadRequest['user'] | null
  token?: string
  exp?: number
  refreshToken?: string
  refreshTokenExpiration?: number
}

const iranPhoneRegex = /^(\+98|0)?9\d{9}$/

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const parseBody = async (
  request: Request,
): Promise<{ name: string; phone: string; password: string; email?: string } | NextResponse> => {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { message: 'Name, phone, and password are required' },
      { status: 400 },
    )
  }

  const { name, phone, password, email } = body as {
    name?: unknown
    phone?: unknown
    password?: unknown
    email?: unknown
  }

  if (typeof name !== 'string' || typeof phone !== 'string' || typeof password !== 'string') {
    return NextResponse.json(
      { message: 'Name, phone, and password are required' },
      { status: 400 },
    )
  }

  const trimmedName = name.trim()
  const trimmedPhone = phone.trim()
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : undefined

  if (!trimmedName) {
    return NextResponse.json({ message: 'Name is required' }, { status: 400 })
  }

  if (!iranPhoneRegex.test(trimmedPhone)) {
    return NextResponse.json({ message: 'Enter a valid Iranian phone number' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: 'Password must be at least 8 characters long' },
      { status: 400 },
    )
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !trimmedEmail) {
      return NextResponse.json({ message: 'Email must be a valid string' }, { status: 400 })
    }

    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ message: 'Enter a valid email address' }, { status: 400 })
    }
  }

  return { name: trimmedName, phone: trimmedPhone, password, email: trimmedEmail }
}

const setAuthCookies = (response: NextResponse, auth: AuthResult) => {
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
}

export const dynamic = 'force-dynamic'

export const POST = async (request: Request) => {
  const payload = await getPayload({ config: configPromise })

  const parsed = await parseBody(request)

  if (parsed instanceof NextResponse) {
    return parsed
  }

  const { name, phone, password, email } = parsed

  try {
    const existing = await payload.find({
      collection: 'users',
      where: {
        phone: {
          equals: phone,
        },
      },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json(
        { message: 'A user with that phone already exists' },
        { status: 409 },
      )
    }
  } catch (error) {
    payload.logger.error?.('Failed to check for existing user by phone', error)
    return NextResponse.json(
      { message: 'Unable to process signup request at this time.' },
      { status: 500 },
    )
  }

  let createdUser: PayloadRequest['user'] | null = null

  try {
    const generatedEmail = `patient-${phone.replace(/\D/g, '') || phone}@cyannobat.local`
    const normalizedEmail = (email ?? generatedEmail).toLowerCase()

    const created = await payload.create({
      collection: 'users',
      data: {
        email: normalizedEmail,
        name,
        phone,
        roles: ['patient'],
        password,
      },
      overrideAccess: true,
    })

    createdUser = created as PayloadRequest['user']
  } catch (error) {
    payload.logger.error?.('Failed to create user during signup', error)

    if (error instanceof Error && /duplicate key value|already exists/i.test(error.message)) {
      return NextResponse.json(
        { message: 'A user with that phone already exists' },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { message: 'Failed to create user account.' },
      { status: 500 },
    )
  }

  let auth: AuthResult | null = null

  try {
    auth = (await payload.login({
      collection: 'users',
      data: {
        phone,
        password,
      },
    } as never)) as AuthResult
  } catch (error) {
    payload.logger.error?.('Failed to authenticate user after signup', error)

    if (createdUser?.email) {
      try {
        auth = (await payload.login({
          collection: 'users',
          data: {
            email: createdUser.email,
            password,
          },
        })) as AuthResult
      } catch (fallbackError) {
        payload.logger.error?.('Signup login fallback with email failed', fallbackError)
      }
    }
  }

  if (!auth || !auth.user) {
    return NextResponse.json(
      { message: 'Failed to authenticate new user.' },
      { status: 500 },
    )
  }

  const authUser = auth.user as PayloadRequest['user']
  const roles = extractRoles(authUser)

  const response = NextResponse.json({
    user: {
      id: String(authUser.id),
      name: typeof authUser.name === 'string' ? authUser.name : '',
      phone: typeof (authUser as { phone?: unknown }).phone === 'string' ? authUser.phone : '',
      roles,
    },
    isStaff: userIsStaff(authUser),
  })

  setAuthCookies(response, auth)

  return response
}
