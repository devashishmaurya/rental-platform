import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for route protection
 * 
 * Public routes are statically generated and accessible without authentication.
 * Protected routes (dashboard, admin) require authentication via Keycloak.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes - allow access (aligned with Next.js auth pattern: public vs protected)
  const publicRoutes = [
    '/',
    '/search',
    '/property-to-rent',
    '/what-we-are',
    '/what-we-do',
    '/about-tenants',
    '/about-landlords',
    '/help-center',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/pricing',
    '/services',
    '/landlords',
    '/api/auth', // Keycloak callback routes
    '/auth/login',
    '/auth/callback',
    '/error/403',
  ]

  const isPublicRoute =
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    ) && !pathname.startsWith('/landlords/add-listing')

  // Allow public routes and static files
  if (
    isPublicRoute ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Protected routes - auth guard: redirect to login when token is missing (Keycloak or Google set same cookie)
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/landlords/add-listing')
  ) {
    const keycloakUrl = (process.env.NEXT_PUBLIC_KEYCLOAK_URL || '').trim()
    const googleClientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim()
    const authEnabled = keycloakUrl.length > 0 || googleClientId.length > 0

    if (authEnabled) {
      const token = request.cookies.get('keycloak-token')
      if (!token?.value) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
