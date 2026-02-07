'use client'

import { useKeycloak } from '@/lib/auth/keycloak'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export const AUTH_REDIRECT_KEY = 'auth_redirect'

/**
 * Login page: triggers Keycloak login and preserves redirect param.
 * After Keycloak returns, user lands on /auth/callback which redirects to the intended path.
 */
export default function LoginPage() {
  const { login, isKeycloakEnabled, isLoading, isAuthenticated } = useKeycloak()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'

  useEffect(() => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(AUTH_REDIRECT_KEY, redirect)
  }, [redirect])

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (!isLoading && isAuthenticated && typeof window !== 'undefined') {
      window.location.href = redirect
    }
  }, [isLoading, isAuthenticated, redirect])

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {isKeycloakEnabled ? (
        <button
          type="button"
          onClick={() => login()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          Sign in with Keycloak
        </button>
      ) : (
        <p className="text-muted-foreground">
          Keycloak is not configured. Set NEXT_PUBLIC_KEYCLOAK_* to enable login.
        </p>
      )}
    </div>
  )
}
