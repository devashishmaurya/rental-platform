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
    '/api/auth', // Keycloak callback routes
    '/auth/login',
    '/auth/callback',
    '/error/403',
  ]

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  // Allow public routes and static files
  if (
    isPublicRoute ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Protected routes - auth guard: redirect to login when token is missing
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL
    const keycloakEnabled =
      !!keycloakUrl && keycloakUrl !== 'http://localhost:8080' && keycloakUrl !== ''

    if (keycloakEnabled) {
      const token = request.cookies.get('keycloak-token')
      if (!token?.value) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
      // Optional: route guard (menu-based access) - stub until menu/roles from API
      // if (!hasMenuAccess(pathname, userMenuItems)) return NextResponse.redirect('/error/403')
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
