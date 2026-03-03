'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useKeycloak } from '@/lib/auth/keycloak'
import { useState } from 'react'
import LoginModal from '@/components/ui/LoginModal'

interface DropdownItem {
  name: string
  href: string
  description?: string
}

interface NavigationItem {
  name: string
  href: string
  dropdown?: DropdownItem[]
  sections?: {
    title?: string
    items: DropdownItem[]
  }[]
}

// Phase 1: Basic navigation structure (extensible for future phases)
const navigation: NavigationItem[] = [
  {
    name: 'About',
    href: '/what-we-are',
    dropdown: [
      { name: 'Landlords', href: '/about-landlords' },
      { name: 'Tenants', href: '/about-tenants' },
      { name: 'About Us', href: '/what-we-are' },
    ],
  },
  {
    name: 'Pricing & Services',
    href: '/what-we-do',
    sections: [
      {
        title: 'Packages',
        items: [
          { name: 'Property Advertising', href: '/pricing/property-advertising' },
        ],
      },
      {
        title: 'Overview',
        items: [
          { name: 'What we do', href: '/what-we-do' },
        ],
      },
    ],
  },
]

function DropdownMenu({ item }: { item: NavigationItem }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  if (!item.dropdown && !item.sections) {
    return null
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        href={item.href}
        className={`text-sm font-medium transition-colors flex items-center space-x-1 font-sans ${
          pathname === item.href || pathname.startsWith(item.href + '/')
            ? 'text-white'
            : 'text-white/90 hover:text-white'
        }`}
      >
        <span>{item.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Link>

      {isOpen && (
        <div
          className={`absolute top-full left-0 pt-2 z-50 ${item.sections ? 'w-80' : 'w-64'}`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2">
          {item.dropdown && (
            <div className="py-1">
              {item.dropdown.map((dropdownItem) => (
                <Link
                  key={dropdownItem.href}
                  href={dropdownItem.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {dropdownItem.name}
                </Link>
              ))}
            </div>
          )}

          {item.sections && (
            <div className="py-1">
              {item.sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {section.title && (
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </div>
                  )}
                  {section.items.map((dropdownItem) => (
                    <Link
                      key={dropdownItem.href}
                      href={dropdownItem.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {dropdownItem.name}
                    </Link>
                  ))}
                  {sectionIndex < item.sections!.length - 1 && (
                    <div className="border-t border-gray-100 my-1" />
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  )
}

function getUserInitial(user: { name?: string; preferred_username?: string } | null): string {
  if (!user) return '?'
  const s = user.name || user.preferred_username || ''
  return (s.charAt(0) || '?').toUpperCase()
}

function UserDropdown({
  user,
  logout,
}: {
  user: { name?: string; preferred_username?: string } | null
  logout: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const displayName = user?.name || user?.preferred_username || 'User'
  const initials = getUserInitial(user)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
        aria-label="User menu"
      >
        <span className="hidden md:block truncate max-w-[120px]">{displayName}</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-medium text-white hover:bg-white/30 transition-colors">
          {initials}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/account/edit"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Edit Profile
            </Link>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated, isLoading, login, logout, isKeycloakEnabled, user } = useKeycloak()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  return (
    <>
      <nav
        className="nav-classic bg-primary-950 text-white sticky top-0 z-50 w-full"
        aria-label="Main navigation"
      >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {/* House icon with arrow */}
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xl font-semibold">Rent Setu</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <DropdownMenu key={item.name} item={item} />
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            {/* Add Listing Button */}
            <Link
              href="/landlords/add-listing"
              className="bg-accent-green text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-accent-green-hover transition-colors"
            >
              Add Listing
            </Link>

            {/* Sign In / Auth — show user when authenticated (Keycloak or Google cookie) */}
            {isLoading ? (
              <div className="w-16 h-6 bg-white/20 animate-pulse rounded"></div>
            ) : isAuthenticated ? (
              <UserDropdown user={user} logout={logout} />
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                Sign in
              </button>
            )}

            {/* Mobile Menu Button */}
            <MobileMenu navigation={navigation} />
          </div>
        </div>
      </div>
    </nav>

    {/* Login Modal */}
    <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  )
}

function MobileMenu({ navigation }: { navigation: NavigationItem[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  return (
    <>
      <button
        className="md:hidden p-2 text-white"
        aria-label="Toggle menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="nav-mobile-panel absolute top-full left-0 right-0 bg-primary-950 border-t border-primary-800 md:hidden z-50">
          <div className="container mx-auto px-4 py-4">
            {navigation.map((item) => (
              <div key={item.name} className="mb-4">
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    className={`text-sm font-medium ${
                      pathname === item.href || pathname.startsWith(item.href + '/')
                        ? 'text-white'
                        : 'text-white/90'
                    }`}
                    onClick={() => {
                      if (!item.dropdown && !item.sections) {
                        setIsOpen(false)
                      }
                    }}
                  >
                    {item.name}
                  </Link>
                  {(item.dropdown || item.sections) && (
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === item.name ? null : item.name)
                      }
                      className="text-white/90"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          openDropdown === item.name ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {openDropdown === item.name && (
                  <div className="mt-2 pl-4 space-y-1">
                    {item.dropdown?.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.href}
                        href={dropdownItem.href}
                        className="block py-2 text-sm text-white/80 hover:text-white"
                        onClick={() => setIsOpen(false)}
                      >
                        {dropdownItem.name}
                      </Link>
                    ))}

                    {item.sections?.map((section, sectionIndex) => (
                      <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-4' : ''}>
                        {section.title && (
                          <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                            {section.title}
                          </div>
                        )}
                        {section.items.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.href}
                            href={dropdownItem.href}
                            className="block py-2 text-sm text-white/80 hover:text-white"
                            onClick={() => setIsOpen(false)}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
