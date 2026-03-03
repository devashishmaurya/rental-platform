'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useKeycloak } from '@/lib/auth/keycloak'
import { SECONDARY_NAV } from '@/config/dashboard'

function getUserInitial(user: { name?: string; preferred_username?: string } | null): string {
  if (!user) return '?'
  const s = user.name || user.preferred_username || ''
  return (s.charAt(0) || '?').toUpperCase()
}

function getActiveSecondary(pathname: string): string {
  if (pathname.startsWith('/dashboard/account')) return '/dashboard/account/edit'
  if (pathname.startsWith('/dashboard/landlord-services') || pathname.startsWith('/services') || pathname.startsWith('/pricing/')) return '/dashboard/landlord-services'
  return '/dashboard'
}

interface SecondaryNavLayoutProps {
  sidebarLinks: readonly { name: string; href: string }[]
  children: React.ReactNode
}

export default function SecondaryNavLayout({ sidebarLinks, children }: SecondaryNavLayoutProps) {
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useKeycloak()
  const displayName = user?.name || user?.preferred_username || 'User'
  const initials = getUserInitial(user)
  const activeSecondary = getActiveSecondary(pathname)

  return (
    <div className="min-h-[60vh] bg-gray-50">
      {/* Secondary navigation bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1" aria-label="Dashboard sections">
            {SECONDARY_NAV.map((item) => {
              const isActive = activeSecondary === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
            <div className="ml-auto py-3">
              <span className="text-sm text-gray-500">Share & Earn</span>
            </div>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Left sidebar */}
          <aside className="w-56 shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              {isAuthenticated && user ? (
                <>
                  <div className="flex flex-col items-center mb-4 pb-4 border-b border-gray-100">
                    <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-lg font-semibold">
                      {initials}
                    </div>
                    <span className="mt-2 text-sm font-medium text-gray-900 truncate w-full text-center">
                      {displayName}
                    </span>
                    <button
                      onClick={() => logout()}
                      className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <Link
                    href="/auth/login"
                    className="block text-center text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Sign in
                  </Link>
                </div>
              )}
              <nav className="space-y-0.5">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-3 py-2 rounded text-sm ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
