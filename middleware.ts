// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';

const AUTH_PAGES = ['/login', '/forgot-password', '/reset-password'];
const PUBLIC_PATHS = [
  '/favicon.ico',
  '/api/auth', // next-auth API
  '/_next', // Next.js internals (static files, chunks, images…)
  '/api/proxy',
  '/manifest.json',
  '/manifest.webmanifest',
  '/sw.js',
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
  '/orders': ['waiter', 'manager'],
  '/my-restaurant': ['manager'],
  '/reservations': ['manager', 'waiter'],
  '/admin': ['root'],
  '/chef': ['waiter', 'manager'],
} as const;

export async function middleware(req: NextRequest) {
  const token = await auth();
  const { pathname, origin, search } = req.nextUrl;
  const hasError =
    token?.error === 'RefreshTokenError' || token?.error === 'NoRefreshToken';

  const userRole = token?.user?.restaurantUsers?.[0]?.role as UserRole;

  // DODAJ: Više debug informacija
  console.log('Token exists:', !!token);
  // console.log('User role:', userRole);

  // Handle root path "/" - redirect based on role or to login
  if (pathname === '/') {
    if (token && !hasError && userRole && ROLE_ROUTES[userRole]) {
      const urlParams = new URLSearchParams(search);
      const redirectTo = urlParams.get('redirect');
      const orderId = urlParams.get('orderId');
      const reservationId = urlParams.get('reservationId');

      // Ako postoji redirect parametar, koristi ga
      if (redirectTo) {
        return NextResponse.redirect(new URL(redirectTo, origin));
      }

      // Ili kreiraj redirect na osnovu parametara
      if (orderId) {
        return NextResponse.redirect(
          new URL(`/orders?orderId=${orderId}`, origin)
        );
      }

      if (reservationId) {
        return NextResponse.redirect(
          new URL(`/reservations?reservationId=${reservationId}`, origin)
        );
      }

      // Inače koristi default rutu za ulogu
      return NextResponse.redirect(new URL(ROLE_ROUTES[userRole], origin));
    } else if (token && !hasError) {
      // Fallback if role is not recognized
      return NextResponse.redirect(new URL('/restaurants', origin));
    } else {
      // Not authenticated, redirect to login
      return NextResponse.redirect(new URL('/login', origin));
    }
  }

  // Prevent authenticated users from accessing auth pages and verify page
  if (token && !hasError) {
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
  if (!token || hasError) {
    console.log(token);
    console.log(hasError);
    console.log('req path ', req);
    if (pathname === '/login') {
      return NextResponse.next();
    }

    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('callbackUrl', pathname + search);

    if (hasError) {
      loginUrl.searchParams.set('error', 'SessionExpired');
    }

    console.log('ulazi ovdeeeee');

    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access for protected routes
  const protectedRoute = Object.keys(ROLE_PROTECTED_ROUTES).find((route) =>
    pathname.startsWith(route)
  ) as keyof typeof ROLE_PROTECTED_ROUTES;

  if (protectedRoute && userRole) {
    const allowedRoles = ROLE_PROTECTED_ROUTES[protectedRoute];
    if (!allowedRoles.includes(userRole)) {
      // console.log(`Role ${userRole} not allowed for ${protectedRoute}`);
      // User doesn't have permission, redirect to their default page
      const defaultRoute = ROLE_ROUTES[userRole];
      return NextResponse.redirect(new URL(defaultRoute, origin));
    }
  }

  // User is authenticated and has proper role access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf|json)$|api/auth).*)',
  ],
};
