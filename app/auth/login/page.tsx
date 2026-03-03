'use client'

import { useKeycloak } from '@/lib/auth/keycloak'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

export const AUTH_REDIRECT_KEY = 'auth_redirect'

const googleClientId =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '')
    : (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '')

const KEYCLOAK_INIT_ERROR_KEY = 'keycloak_init_error'
const KEYCLOAK_INIT_URL_KEY = 'keycloak_init_url'
const KEYCLOAK_ERROR_FROM_CALLBACK_KEY = 'keycloak_error_from_callback'

function LoginContent() {
  const { login, isKeycloakEnabled, isLoading, isAuthenticated, keycloak } = useKeycloak()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const initError = searchParams.get('error') === 'keycloak_init'
  const googleError = searchParams.get('error') // google_denied | google_config | google_token
  const isGoogleEnabled = Boolean(googleClientId)
  const [keycloakErrorDetail, setKeycloakErrorDetail] = useState<string | null>(null)
  const [keycloakInitUrl, setKeycloakInitUrl] = useState<string | null>(null)
  const [errorFromCallback, setErrorFromCallback] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const msg = sessionStorage.getItem(KEYCLOAK_INIT_ERROR_KEY)
      const url = sessionStorage.getItem(KEYCLOAK_INIT_URL_KEY)
      const fromCallback = sessionStorage.getItem(KEYCLOAK_ERROR_FROM_CALLBACK_KEY)
      if (msg) {
        setKeycloakErrorDetail(msg)
        sessionStorage.removeItem(KEYCLOAK_INIT_ERROR_KEY)
      }
      if (url !== null) {
        setKeycloakInitUrl(url)
        sessionStorage.removeItem(KEYCLOAK_INIT_URL_KEY)
      }
      if (fromCallback) {
        setErrorFromCallback(true)
        sessionStorage.removeItem(KEYCLOAK_ERROR_FROM_CALLBACK_KEY)
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Get current origin for dynamic error messages
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  const callbackUrl = `${currentOrigin}/auth/callback`

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

  // Test Keycloak server connectivity (development only)
  useEffect(() => {
    if (isKeycloakEnabled && !isLoading && !keycloak && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const testKeycloakConnectivity = async () => {
        const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL
        const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'rentsetu'
        if (keycloakUrl) {
          try {
            const wellKnownUrl = `${keycloakUrl}/realms/${realm}/.well-known/openid-configuration`
            const response = await fetch(wellKnownUrl)
            if (!response.ok) {
              console.warn(`Keycloak server not accessible: ${response.status} ${response.statusText}`)
            } else {
              console.log('Keycloak server is accessible')
            }
          } catch (error) {
            // Silent error handling - only warn in development
            console.warn('Cannot reach Keycloak server:', error)
          }
        }
      }
      testKeycloakConnectivity()
    }
  }, [isKeycloakEnabled, isLoading, keycloak])

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const googleLoginUrl = `/api/auth/google?redirect=${encodeURIComponent(redirect)}`

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {googleError && (googleError === 'google_denied' || googleError === 'google_config' || googleError === 'google_token') && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200 max-w-2xl">
          {googleError === 'google_denied' && <p>Google sign-in was cancelled or denied.</p>}
          {googleError === 'google_config' && <p>Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.</p>}
          {googleError === 'google_token' && <p>Google sign-in failed. Please try again.</p>}
        </div>
      )}
      {initError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200 max-w-2xl">
          <p className="font-medium">Sign-in could not be completed.</p>
          <p className="mt-2">
            In Keycloak Admin Console, configure the client <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">{process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'rentsetu-client'}</code> in realm <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">{process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'rentsetu'}</code>:
          </p>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>
              <strong>Web origins</strong> must include: <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">{currentOrigin || 'your-app-url'}</code>
            </li>
            <li>
              <strong>Valid redirect URIs</strong> must include: <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">{callbackUrl || 'your-app-url/auth/callback'}</code>
            </li>
            <li>
              <strong>Access Type</strong> must be set to <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">public</code>
            </li>
          </ul>
          <p className="mt-2 text-xs">
            App proxy (browser): <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">{process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'not configured'}</code> · Keycloak server (Admin): <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">{process.env.NEXT_PUBLIC_KEYCLOAK_ADMIN_URL || 'optional — set for Open Keycloak link'}</code>
          </p>
          <p className="mt-2">
            <strong>Steps:</strong> Go to Keycloak Admin → Realm <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">{process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'rentsetu'}</code> → Clients → <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">{process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'rentsetu-client'}</code> → Settings tab → Update the values above → Save
          </p>
        </div>
      )}
      {isKeycloakEnabled ? (
        <>
          {!keycloak && !isLoading && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200 max-w-2xl">
              {errorFromCallback ? (
                <>
                  <p className="font-medium">Sign-in could not be completed</p>
                  <p className="mt-2 text-amber-800 dark:text-amber-200">
                    You were redirected back from Keycloak but we couldn’t finish signing you in. This can happen if the session expired or the token exchange failed.
                  </p>
                  <p className="mt-3 font-medium">Click &quot;Sign in with Keycloak&quot; below to try again.</p>
                </>
              ) : (
                <>
                  <p className="font-medium">Keycloak initialization failed (you can still sign in below)</p>
                  {keycloakErrorDetail && (
                    <p className="mt-2 rounded bg-amber-100/80 px-2 py-1 font-mono text-xs break-all dark:bg-amber-900/50">
                      Reason: {keycloakErrorDetail}
                    </p>
                  )}
                  {keycloakInitUrl !== null && (
                    <p className="mt-2 rounded bg-amber-100/80 px-2 py-1 font-mono text-xs break-all dark:bg-amber-900/50">
                      Init URL: {keycloakInitUrl || '(empty — rebuild with NEXT_PUBLIC_KEYCLOAK_URL set)'}
                    </p>
                  )}
                  <p className="mt-2">
                    In Keycloak Admin, open realm <strong>{process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'rentsetu'}</strong> → Clients → <strong>{process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'rentsetu-client'}</strong> → Settings and set:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>
                      <strong>Valid redirect URIs:</strong> add exactly{' '}
                      <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50 break-all">{callbackUrl}</code>
                      {' '}(or try adding <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">{currentOrigin || 'http://localhost:3000'}/*</code> as well)
                    </li>
                    <li>
                      <strong>Web origins:</strong> add exactly{' '}
                      <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50 break-all">{currentOrigin || 'http://localhost:3000'}</code>
                      {' '}(or <code className="rounded bg-amber-100 px-1">*</code> for dev only)
                    </li>
                    <li>
                      <strong>Access type:</strong> <code className="rounded bg-amber-100 px-1">public</code> (and turn <strong>Client authentication</strong> OFF if using newer Keycloak)
                    </li>
                    <li>
                      <strong>Root URL:</strong> set to <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50 break-all">{currentOrigin || 'http://localhost:3000'}</code> (your app origin; not the Keycloak server URL)
                    </li>
                  </ul>
                  <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
                    App proxy (browser): <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">{process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'not set'}</code> → Keycloak server: <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">{process.env.NEXT_PUBLIC_KEYCLOAK_ADMIN_URL || 'set NEXT_PUBLIC_KEYCLOAK_ADMIN_URL e.g. http://103.174.103.7:8081'}</code> · Realm: {process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'rentsetu'} · Client: {process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'rentsetu-client'}
                  </p>
                  <a
                    href={((process.env.NEXT_PUBLIC_KEYCLOAK_ADMIN_URL || process.env.NEXT_PUBLIC_KEYCLOAK_URL) || '').replace(/\/$/, '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block font-medium text-primary-600 hover:text-primary-700 underline"
                  >
                    Open Keycloak
                  </a>
                  <span className="mt-2 block text-xs text-amber-800 dark:text-amber-200">
                    Log in to Keycloak, then go to <strong>Realm rentsetu</strong> → <strong>Clients</strong> → <strong>rentsetu-client</strong> → Settings. Use <strong>Access settings</strong> for URIs and <strong>Capability config</strong> for Client authentication.
                  </span>
                  <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
                    If it still fails: in .env set <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_KEYCLOAK_URL=http://103.174.103.7:8081</code> (Keycloak runs on 8081). Then <strong>rebuild</strong> (<code className="rounded bg-amber-100 px-1">npm run build</code>) and restart — NEXT_PUBLIC_* are fixed at build time.
                  </p>
                  <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                    In Console check <code className="rounded bg-amber-100 px-1">[Keycloak] Init URL</code> — if empty, rebuild with .env set. In Network tab filter by <code className="rounded bg-amber-100 px-1">realms</code> or <code className="rounded bg-amber-100 px-1">keycloak</code> to see the config request.
                  </p>
                  <p className="mt-3 font-medium">Click &quot;Sign in with Keycloak&quot; below to try anyway — we&apos;ll redirect you to Keycloak.</p>
                </>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => login()}
            disabled={isLoading}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Sign in with Keycloak'}
          </button>
        </>
      ) : null}
      {isGoogleEnabled && (
        <a
          href={googleLoginUrl}
          className="rounded-md border border-input bg-background px-4 py-2 text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Sign in with Google
        </a>
      )}
      {!isKeycloakEnabled && !isGoogleEnabled && (
        <p className="text-muted-foreground">
          Login is not configured. Set NEXT_PUBLIC_KEYCLOAK_* or NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable sign-in.
        </p>
      )}
    </div>
  )
}

/**
 * Login page: triggers Keycloak login and preserves redirect param.
 * After Keycloak returns, user lands on /auth/callback which redirects to the intended path.
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
