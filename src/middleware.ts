import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || '';
  const path = request.nextUrl.pathname;

  // Define all the protected paths
  const isProtectedPath = path.startsWith('/dashboard');
  const isLoginPath = path === '/login';

  // If the user is accessing a protected path without a token, redirect to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is already logged in and trying to access login page, redirect to dashboard
  if (isLoginPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user is accessing the root path, redirect to dashboard if logged in or login if not
  if (path === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
};