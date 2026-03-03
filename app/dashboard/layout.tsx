'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useKeycloak } from '@/lib/auth/keycloak'
import SecondaryNavLayout from '@/components/layout/SecondaryNavLayout'
import {
  DASHBOARD_SIDEBAR,
  ACCOUNT_SIDEBAR,
  LANDLORD_SERVICES,
} from '@/config/dashboard'

function getSidebarLinks(pathname: string): { name: string; href: string }[] {
  if (pathname.startsWith('/dashboard/account')) return [...ACCOUNT_SIDEBAR]
  if (pathname.startsWith('/dashboard/landlord-services')) return [...LANDLORD_SERVICES]
  return [...DASHBOARD_SIDEBAR]
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useKeycloak()
  const sidebarLinks = getSidebarLinks(pathname)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login?redirect=' + encodeURIComponent(pathname || '/dashboard'))
    }
  }, [isLoading, isAuthenticated, router, pathname])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <p className="text-muted-foreground">Redirecting to sign in...</p>
      </div>
    )
  }

  return (
    <SecondaryNavLayout sidebarLinks={sidebarLinks}>
      {children}
    </SecondaryNavLayout>
  )
}
