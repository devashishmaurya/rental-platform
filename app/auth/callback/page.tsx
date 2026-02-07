'use client'

import { useKeycloak } from '@/lib/auth/keycloak'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const AUTH_REDIRECT_KEY = 'auth_redirect'

/**
 * Keycloak redirect target after login. Reads redirect from query or sessionStorage and redirects.
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoading } = useKeycloak()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    const redirect =
      searchParams.get('redirect') ??
      (typeof window !== 'undefined' ? sessionStorage.getItem(AUTH_REDIRECT_KEY) : null) ??
      '/dashboard'
    if (typeof window !== 'undefined') sessionStorage.removeItem(AUTH_REDIRECT_KEY)

    if (!isLoading) {
      setDone(true)
      router.replace(redirect)
    }
  }, [isLoading, searchParams, router, done])

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  )
}
