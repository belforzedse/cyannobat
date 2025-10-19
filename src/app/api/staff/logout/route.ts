import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export const POST = async () => {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('payload-token', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 0,
  })
  response.cookies.set('payload-refresh-token', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 0,
  })
  return response
}

