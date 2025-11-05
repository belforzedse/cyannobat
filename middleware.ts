import { NextRequest, NextResponse } from 'next/server';

const isStaffPath = (pathname: string): boolean => {
  if (pathname.startsWith('/api/staff')) return true;
  if (pathname.startsWith('/staff')) {
    if (pathname.startsWith('/staff/login')) return false;
    return true;
  }
  return false;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isStaffPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('payload-token');

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/staff/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/staff/:path*', '/api/staff/:path*'],
};
