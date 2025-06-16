import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const auth = req.cookies.get('AuthSession');
  if (!auth) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  const employee = req.cookies.get('Employee');
  if (!employee) {
    return NextResponse.redirect(new URL('/landing', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings', '/autos/:path*', '/rh/:path*'],
};
