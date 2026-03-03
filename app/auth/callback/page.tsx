'use client'

import { useKeycloak } from '@/lib/auth/keycloak'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

const AUTH_REDIRECT_KEY = 'auth_redirect'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoading, isAuthenticated } = useKeycloak()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    // Only read redirect and redirect after Keycloak init has finished.
    // (Reading/storing redirect earlier would clear sessionStorage before we use it when isLoading was still true.)
    if (!isLoading) {
      const fromQuery = searchParams.get('redirect')
      const fromStorage = typeof window !== 'undefined' ? sessionStorage.getItem(AUTH_REDIRECT_KEY) : null
      let redirect = fromQuery ?? fromStorage ?? '/dashboard'
      // Sanitize: only allow same-origin paths (start with /, not //)
      if (typeof redirect !== 'string' || !redirect.startsWith('/') || redirect.startsWith('//')) {
        redirect = '/dashboard'
      }
      if (typeof window !== 'undefined') sessionStorage.removeItem(AUTH_REDIRECT_KEY)
      setDone(true)
      if (isAuthenticated) {
        router.replace(redirect)
      } else {
        router.replace(`/auth/login?redirect=${encodeURIComponent(redirect)}`)
      }
    }
  }, [isLoading, isAuthenticated, searchParams, router, done])

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  )
}

/**
 * Keycloak redirect target after login. Reads redirect from query or sessionStorage and redirects.
 */
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-muted-foreground">Signing you in...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
