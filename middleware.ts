// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const AUTH_PAGES = ['/login', '/register'];
const PUBLIC_PATHS = [
  '/favicon.ico',
  '/api/auth', // next-auth API
  '/_next', // Next.js internals (static files, chunks, images…)
  '/api/proxy',
];

// Role-based route mappings
const ROLE_ROUTES = {
  root: '/restaurants',
  waiter: '/orders',
  manager: '/my-restaurant',
} as const;

type UserRole = keyof typeof ROLE_ROUTES;

// Protected routes that require specific roles
const ROLE_PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/restaurants': ['root'],
  '/orders': ['waiter'],
  '/my-restaurant': ['manager'],
  '/reservations': ['manager', 'waiter'],
  '/admin': ['root'],
  '/kitchen': ['waiter', 'manager'],
} as const;

export async function middleware(req: NextRequest) {
  const { pathname, origin, search } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userRole = token?.user?.restaurantUsers[0]?.role as UserRole;

  // Handle root path "/" - redirect based on role or to login
  if (pathname === '/') {
    if (token && userRole && ROLE_ROUTES[userRole]) {
      return NextResponse.redirect(new URL(ROLE_ROUTES[userRole], origin));
    } else if (token) {
      // Fallback if role is not recognized
      return NextResponse.redirect(new URL('/restaurants', origin));
    } else {
      // Not authenticated, redirect to login
      return NextResponse.redirect(new URL('/login', origin));
    }
  }

  // Prevent authenticated users from accessing auth pages and verify page
  if (token) {
    if (AUTH_PAGES.includes(pathname)) {
      // Redirect to user's role-specific page
      const defaultRoute =
        userRole && ROLE_ROUTES[userRole]
          ? ROLE_ROUTES[userRole]
          : '/restaurants';
      return NextResponse.redirect(new URL(defaultRoute, origin));
    }

    // Prevent access to verify page if already authenticated
    if (pathname === '/verify') {
      const defaultRoute =
        userRole && ROLE_ROUTES[userRole]
          ? ROLE_ROUTES[userRole]
          : '/restaurants';
      return NextResponse.redirect(new URL(defaultRoute, origin));
    }
  }

  // Allow public paths and auth pages for non-authenticated users
  if (
    AUTH_PAGES.includes(pathname) ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname === '/verify' // Allow verify page for non-authenticated users
  ) {
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!token) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access for protected routes
  const protectedRoute = Object.keys(ROLE_PROTECTED_ROUTES).find((route) =>
    pathname.startsWith(route)
  ) as keyof typeof ROLE_PROTECTED_ROUTES;

  if (protectedRoute && userRole) {
    const allowedRoles = ROLE_PROTECTED_ROUTES[protectedRoute];
    if (!allowedRoles.includes(userRole)) {
      // User doesn't have permission, redirect to their default page
      const defaultRoute = ROLE_ROUTES[userRole];
      return NextResponse.redirect(new URL(defaultRoute, origin));
    }
  }

  // User is authenticated and has proper role access
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
