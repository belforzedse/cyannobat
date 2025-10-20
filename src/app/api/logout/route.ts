import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export const POST = async () => {
  const response = NextResponse.json({ ok: true })
  const secureCookies = process.env.NODE_ENV === 'production'

  response.cookies.set('payload-token', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookies,
    maxAge: 0,
  })

  response.cookies.set('payload-refresh-token', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookies,
    maxAge: 0,
  })

  return response
}
