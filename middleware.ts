import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const employee = req.cookies.get('employeeNumber');
  const openPaths = [
    '/core',
    '/support',
    '/public',
    '/api',
    '/login', // allow unauthenticated access to the login page
  ];
  const allowed = openPaths.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!employee && !allowed) {
    return NextResponse.redirect(new URL('/core', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
