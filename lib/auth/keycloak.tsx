'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  TOKEN_COOKIE,
  USER_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_STORAGE_KEY,
  USER_NAME_STORAGE_KEY,
  getClientToken,
  getClientRefreshToken,
  getClientUser,
} from './constants'

const KC_CALLBACK_PREFIX = 'kc-callback-'

/** Generate a simple UUID v4-like string for state. */
function createState(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Generate PKCE code_verifier (43–128 chars) and code_challenge (S256). */
async function generatePkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < 32; i++) array[i] = Math.floor(Math.random() * 256)
  }
  const codeVerifier = base64UrlEncode(array)
  const codeChallenge = await sha256Base64Url(codeVerifier)
  return { codeVerifier, codeChallenge }
}

function base64UrlEncode(buffer: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sha256Base64Url(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(hash))
}

/** Decode JWT payload (no verification; used for user display from token we just received from Keycloak). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const json = atob(padded)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

/** On callback with code + state: if we have our stored state (manual redirect), exchange code for token and set auth. Returns true if we handled it. */
async function tryManualCallbackTokenExchange(
  setAuth: (token: string, refreshToken: string, user: KeycloakUser) => void
): Promise<boolean> {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  const state = params.get('state')
  const code = params.get('code')
  const errorParam = params.get('error')
  if (errorParam || !state || !code) return false
  const storedRaw = localStorage.getItem(KC_CALLBACK_PREFIX + state)
  if (!storedRaw) return false
  let stored: { state?: string; redirectUri?: string; pkceCodeVerifier?: string; expires?: number }
  try {
    stored = JSON.parse(storedRaw)
  } catch {
    return false
  }
  if (stored.expires != null && Date.now() > stored.expires) {
    try {
      localStorage.removeItem(KC_CALLBACK_PREFIX + state)
    } catch {
      /* ignore */
    }
    return false
  }
  // Use plain URL for redirect_uri (URLSearchParams will encode once); avoid double-encoding
  let redirectUri = stored.redirectUri || `${window.location.origin}/auth/callback`
  if (redirectUri.includes('%')) {
    try {
      redirectUri = decodeURIComponent(redirectUri)
    } catch {
      /* keep as-is */
    }
  }
  const codeVerifier = stored.pkceCodeVerifier
  const keycloakBase = (process.env.NEXT_PUBLIC_KEYCLOAK_URL || '').trim()
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'rentsetu'
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'rentsetu-client'
  if (!keycloakBase || !codeVerifier) return false
  const tokenUrl = `${keycloakBase.replace(/\/$/, '')}/realms/${realm}/protocol/openid-connect/token`
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  })
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  })
  try {
    localStorage.removeItem(KC_CALLBACK_PREFIX + state)
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const text = await res.text()
    console.warn('[Keycloak] Token exchange failed:', res.status, text)
    try {
      const err = JSON.parse(text) as { error?: string; error_description?: string }
      if (err.error_description) console.warn('[Keycloak] Keycloak says:', err.error_description)
    } catch {
      /* ignore */
    }
    return false
  }
  const data = (await res.json()) as { access_token?: string; refresh_token?: string; id_token?: string }
  const accessToken = data.access_token
  const refreshToken = data.refresh_token || ''
  if (!accessToken) return false
  const idToken = data.id_token || accessToken
  const parsed = decodeJwtPayload(idToken)
  const user: KeycloakUser = {
    name: (parsed?.name as string) ?? (parsed?.preferred_username as string) ?? '',
    preferred_username: (parsed?.preferred_username as string) ?? undefined,
    given_name: (parsed?.given_name as string) ?? undefined,
    family_name: (parsed?.family_name as string) ?? undefined,
    email: (parsed?.email as string) ?? undefined,
  }
  setAuth(accessToken, refreshToken, user)
  return true
}

/** Set auth cookies and localStorage (user name / user object) for middleware and easy access. */
function setAuthCookie(
  token: string | null,
  userInfo?: unknown,
  refreshToken?: string | null,
  user?: KeycloakUser | null
) {
  if (typeof document === 'undefined') return
  const maxAge = token ? 60 * 60 * 24 : 0

  // Only set Secure when the page is actually served over HTTPS. On HTTP (e.g. server at
  // http://103.174.103.7:8082), Secure cookies are never stored/sent, causing immediate logout.
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  let sameSite = 'SameSite=Lax'
  let secure = ''

  if (typeof window !== 'undefined') {
    const isCrossOrigin = apiUrl && !apiUrl.includes(window.location.hostname)
    if (isCrossOrigin && isHttps) {
      sameSite = 'SameSite=None'
      secure = '; Secure'
    }
  }

  if (isHttps && sameSite === 'SameSite=Lax') {
    secure = '; Secure'
  }

  const opts = `path=/; max-age=${maxAge}; ${sameSite}${secure}`
  const clearOpts = 'path=/; max-age=0; SameSite=Lax'

  // Single token cookie only (keycloak-token). Clear any legacy duplicate cookies.
  if (token) {
    document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; ${opts}`
    ;(document as Document & { token?: string }).token = token
    // Remove old duplicate cookies so only keycloak-token remains
    document.cookie = `token=; ${clearOpts}`
    document.cookie = `auth_token=; ${clearOpts}`
  } else {
    document.cookie = `${TOKEN_COOKIE}=; ${clearOpts}`
    document.cookie = `token=; ${clearOpts}`
    document.cookie = `auth_token=; ${clearOpts}`
    delete (document as Document & { token?: string }).token
  }
  if (refreshToken) {
    document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(refreshToken)}; ${opts}`
  } else {
    document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`
  }
  if (userInfo != null) {
    const userPayload = { ...(userInfo as object), authenticated: !!token }
    document.cookie = `${USER_COOKIE}=${encodeURIComponent(JSON.stringify(userPayload))}; ${opts}`
  }
  if (token && user) {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      const displayName = user.name || user.preferred_username || ''
      localStorage.setItem(USER_NAME_STORAGE_KEY, displayName)
    } catch {
      /* ignore */
    }
  } else {
    clearUserStorage()
  }
}

function clearUserStorage() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(USER_NAME_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return
  const opts = 'path=/; max-age=0; SameSite=Lax'
  document.cookie = `${TOKEN_COOKIE}=; ${opts}`
  document.cookie = `token=; ${opts}`
  document.cookie = `auth_token=; ${opts}`
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; ${opts}`
  document.cookie = `${USER_COOKIE}=; ${opts}`
  delete (document as Document & { token?: string }).token
  clearUserStorage()
}

// Check if Keycloak is configured (URL and client ID must be set)
const isKeycloakConfigured = () => {
  if (typeof window === 'undefined') return false
  const url = (process.env.NEXT_PUBLIC_KEYCLOAK_URL || '').trim()
  const clientId = (process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || '').trim()
  return url.length > 0 && clientId.length > 0
}

/** Detect local origin (localhost/127.0.0.1). Keycloak is enabled for both local and server when configured. */
const isLocalOrigin = () => {
  if (typeof window === 'undefined') return false
  const o = window.location.origin
  return o.includes('localhost') || o === 'http://127.0.0.1' || o.startsWith('http://127.0.0.1:')
}

export interface KeycloakUser {
  name?: string
  preferred_username?: string
  given_name?: string
  family_name?: string
  email?: string
}

interface KeycloakContextType {
  isAuthenticated: boolean
  isLoading: boolean
  keycloak: any
  login: () => void
  logout: () => void
  token: string | null
  isKeycloakEnabled: boolean
  user: KeycloakUser | null
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined)

interface KeycloakProviderProps {
  children: ReactNode
}

function getUserFromKeycloak(instance: any): KeycloakUser | null {
  if (!instance) return null
  const parsed = instance.tokenParsed
  const info = instance.userInfo
  const name =
    parsed?.name ??
    info?.name ??
    ([parsed?.given_name, parsed?.family_name].filter(Boolean).join(' ') || info?.preferred_username)
  const preferred_username = parsed?.preferred_username ?? info?.preferred_username
  if (!name && !preferred_username) return null
  return {
    name: name || preferred_username,
    preferred_username: preferred_username ?? undefined,
    given_name: parsed?.given_name ?? info?.given_name,
    family_name: parsed?.family_name ?? info?.family_name,
    email: parsed?.email ?? info?.email,
  }
}

export function KeycloakProvider({ children }: KeycloakProviderProps) {
  const [keycloak, setKeycloak] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [isKeycloakEnabled, setIsKeycloakEnabled] = useState(false)
  const [user, setUser] = useState<KeycloakUser | null>(null)

  // When we skip Keycloak or it fails, still recognize Google (cookie) login
  const applyCookieAuth = useCallback(() => {
    const cookieToken = getClientToken()
    const cookieUser = getClientUser()
    if (cookieToken && cookieUser) {
      setIsAuthenticated(true)
      setToken(cookieToken)
      setUser(cookieUser as KeycloakUser)
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(cookieUser))
          const displayName = (cookieUser.name || cookieUser.preferred_username || '') as string
          localStorage.setItem(USER_NAME_STORAGE_KEY, displayName)
        }
      } catch {
        /* ignore */
      }
    }
  }, [])

  useEffect(() => {
    const keycloakConfigured = isKeycloakConfigured()
    const localOnly = isLocalOrigin()
    // Keycloak + Google when configured (including on localhost).
    const enableKeycloak = keycloakConfigured
    setIsKeycloakEnabled(enableKeycloak)

    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('Auth:', { keycloakConfigured, localOnly, enableKeycloak: enableKeycloak ? 'Keycloak + Google' : 'Google only' })
    }

    if (!keycloakConfigured) {
      setIsLoading(false)
      applyCookieAuth()
      setIsAuthenticated(true) // no Keycloak = no auth gate; cookie auth may have set user
      return
    }
    // Initialize Keycloak on both localhost and server when configured.

    const initKeycloak = async () => {
      const isCallback =
        typeof window !== 'undefined' && window.location.pathname === '/auth/callback'
      const savedToken = getClientToken()
      const savedRefresh = getClientRefreshToken()

      try {
        const KeycloakClass = (await import('keycloak-js')).default
        const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'rentsetu'
        const keycloakBase = (process.env.NEXT_PUBLIC_KEYCLOAK_URL || '').trim()
        const keycloakConfig = {
          url: keycloakBase || undefined,
          realm,
          clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'rentsetu-client',
        }
        if (!keycloakBase) {
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem('keycloak_init_url', '')
              sessionStorage.setItem('keycloak_init_error', 'NEXT_PUBLIC_KEYCLOAK_URL is empty — rebuild with .env')
            } catch {
              /* ignore */
            }
          }
          console.warn(
            '[Keycloak] NEXT_PUBLIC_KEYCLOAK_URL is empty. On the server, set .env and rebuild:',
            'NEXT_PUBLIC_KEYCLOAK_URL=http://103.174.103.7:8081',
            'Then run: npm run build'
          )
          setKeycloak(null)
          setIsLoading(false)
          applyCookieAuth()
          return
        }
        console.log('[Keycloak] Init URL:', keycloakBase, keycloakBase.includes('/api/keycloak') ? '(proxy)' : '(direct)')
        // On callback: if we have our stored state (manual redirect), exchange code for token ourselves; keycloak-js won't have that state
        if (isCallback) {
          const handled = await tryManualCallbackTokenExchange((accessToken, refreshToken, user) => {
            setAuthCookie(accessToken, undefined, refreshToken, user)
            setKeycloak(null)
            setIsAuthenticated(true)
            setToken(accessToken)
            setUser(user)
            setIsLoading(false)
          })
          if (handled) return
        }
        // One diagnostic fetch so the request appears in Network tab (filter by "realms" or "keycloak")
        const wellKnownUrl = `${keycloakBase.replace(/\/$/, '')}/realms/${realm}/.well-known/openid-configuration`
        try {
          const probe = await fetch(wellKnownUrl, { cache: 'no-store' })
          if (!probe.ok) console.warn('[Keycloak] Well-known fetch failed:', probe.status, wellKnownUrl)
        } catch (e) {
          console.warn('[Keycloak] Well-known fetch error:', e instanceof Error ? e.message : e, wellKnownUrl)
        }
        const keycloakInstance = new KeycloakClass(keycloakConfig)

        // Dynamically set redirect URI based on current origin (works for localhost and production)
        const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
        
        const initOptions: Parameters<typeof keycloakInstance.init>[0] = {
          checkLoginIframe: false,
          pkceMethod: 'S256',
          responseMode: 'query',
          redirectUri, // Explicitly set redirect URI for localhost support
        }
        
        // Log redirect URI in development for debugging
        if (process.env.NODE_ENV === 'development' && redirectUri) {
          console.log('Keycloak redirect URI:', redirectUri)
        }

        // Restore session from cookies on full page load (not on callback)
        if (!isCallback && savedToken && savedRefresh) {
          initOptions.token = savedToken
          initOptions.refreshToken = savedRefresh
        }

        const authenticated = await keycloakInstance.init(initOptions)

        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('Keycloak init result:', {
            authenticated,
            hasToken: !!keycloakInstance.token,
            hasRefreshToken: !!keycloakInstance.refreshToken,
            error: (keycloakInstance as any).error || null,
          })
        }

        // Keycloak init returned not authenticated and no token — might be cookie auth (e.g. Google)
        if (!authenticated && !keycloakInstance.token) {
          const cookieToken = getClientToken()
          const cookieUser = getClientUser()
          if (cookieToken && cookieUser) {
            setKeycloak(null)
            setIsAuthenticated(true)
            setToken(cookieToken)
            setUser(cookieUser as KeycloakUser)
            try {
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(cookieUser))
              const displayName = (cookieUser.name || cookieUser.preferred_username || '') as string
              localStorage.setItem(USER_NAME_STORAGE_KEY, displayName)
            } catch {
              /* ignore */
            }
            setIsLoading(false)
            return
          }
          const hasInitError = !!(keycloakInstance as any).error
          // On callback: always treat as failure so we redirect to login with message
          // On login page: only treat as failure when there was a real error; otherwise keep the
          // instance so "Sign in with Keycloak" uses keycloak.login() (state + PKCE) and the token exchange works
          if (isCallback || hasInitError) {
            const errorMessage = (keycloakInstance as any).error || 'Initialization failed'
            if (typeof window !== 'undefined') {
              try {
                sessionStorage.setItem('keycloak_init_error', String(errorMessage))
                sessionStorage.setItem('keycloak_init_url', keycloakBase)
                if (isCallback) {
                  sessionStorage.setItem('keycloak_error_from_callback', '1')
                }
              } catch {
                /* ignore */
              }
            }
            if (process.env.NODE_ENV === 'development') {
              console.warn('Keycloak initialization failed:', errorMessage)
            }
            setKeycloak(null)
            setIsAuthenticated(false)
            setIsLoading(false)
            return
          }
          // Login page, no error: keep keycloak instance so keycloak.login() sets state/PKCE for callback
          setKeycloak(keycloakInstance)
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        // Success: we have token and/or authenticated; cookie is set below when authenticated || newToken

        const newToken = keycloakInstance.token || null
        const newRefresh = keycloakInstance.refreshToken || null
        const userObj = getUserFromKeycloak(keycloakInstance)
        // Only clear cookie when we had a full Keycloak session (token + refresh) that failed; don't clear when we just got a new token (e.g. code exchange)
        if (!authenticated && savedToken && savedRefresh && !newToken) {
          clearAuthCookie()
        } else if (authenticated || newToken) {
          setAuthCookie(newToken, keycloakInstance.userInfo, newRefresh, userObj)
        }
        setKeycloak(keycloakInstance)
        let finalAuthenticated = authenticated
        let finalToken = newToken
        let finalUser = userObj
        // If Keycloak says not authenticated, treat as logged in when we have a token (e.g. after code exchange) or cookie auth
        if (!authenticated) {
          if (newToken && userObj) {
            finalAuthenticated = true
            finalToken = newToken
            finalUser = userObj
          } else {
            const cookieToken = getClientToken()
            const cookieUser = getClientUser()
            if (cookieToken && cookieUser) {
              finalAuthenticated = true
              finalToken = cookieToken
              finalUser = cookieUser as KeycloakUser
              try {
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(cookieUser))
                const displayName = (cookieUser.name || cookieUser.preferred_username || '') as string
                localStorage.setItem(USER_NAME_STORAGE_KEY, displayName)
              } catch {
                /* ignore */
            }
            }
          }
        }
        setIsAuthenticated(finalAuthenticated)
        setToken(finalToken)
        setUser(finalUser)

        keycloakInstance.onTokenExpired = () => {
          keycloakInstance.updateToken(30).then((refreshed: boolean) => {
            if (refreshed) {
              const t = keycloakInstance.token || null
              const r = keycloakInstance.refreshToken || null
              setToken(t)
              setAuthCookie(t, keycloakInstance.userInfo, r, getUserFromKeycloak(keycloakInstance))
            }
          })
        }
      } catch (error) {
        const isCallback = typeof window !== 'undefined' && window.location.pathname === '/auth/callback'
        
        if (process.env.NODE_ENV === 'development') {
          const msg = error instanceof Error ? error.message : String(error ?? '')
          const isCorsOrNetwork =
            /fetch|network|cors|failed to fetch|load failed/i.test(msg) || (error instanceof TypeError && msg.includes('fetch'))
          console.warn(
            '[Keycloak] Initialization failed:',
            msg || '(no message)'
          )
          if (isCorsOrNetwork) {
            console.warn(
              '[Keycloak] Likely CORS or network: ensure client Web origins in Keycloak includes',
              typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
            )
          }
          console.info('[Keycloak] Config:', {
            url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
            realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
            clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
            origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
          })
        }
        
        setKeycloak(null)
        applyCookieAuth()
        if (!getClientToken() || !getClientUser()) setIsAuthenticated(false)
        if (isCallback && typeof window !== 'undefined') {
          try {
            const msg = error instanceof Error ? error.message : String(error ?? '')
            if (msg) sessionStorage.setItem('keycloak_init_error', msg)
            const url = (process.env.NEXT_PUBLIC_KEYCLOAK_URL || '').trim()
            sessionStorage.setItem('keycloak_init_url', url)
            sessionStorage.setItem('keycloak_error_from_callback', '1')
          } catch {
            /* ignore */
          }
          window.location.replace('/auth/login?error=keycloak_init')
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Safety: if init hangs (e.g. well-known or keycloak.init() never resolves), stop showing Loading after 12s
    const isAuthPage =
      typeof window !== 'undefined' &&
      (window.location.pathname === '/auth/login' || window.location.pathname === '/auth/callback')
    const loadingTimeout =
      isAuthPage &&
      setTimeout(() => {
        setIsLoading((prev) => {
          if (prev) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[Keycloak] Init timeout — stopping loading state so login page can show')
            }
            return false
          }
          return prev
        })
      }, 12000)

    initKeycloak()

    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout)
    }
  }, [applyCookieAuth])

  const login = () => {
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Login attempt:', {
        hasKeycloak: !!keycloak,
        hasLoginFunction: keycloak && typeof keycloak.login === 'function',
        isKeycloakEnabled,
        isLoading,
      })
    }

    if (keycloak && typeof keycloak.login === 'function' && isKeycloakEnabled) {
      const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : ''
      if (process.env.NODE_ENV === 'development') {
        console.log('Calling keycloak.login with redirectUri:', redirectUri)
      }
      try {
        keycloak.login({ redirectUri })
      } catch (error) {
        // Only log in development, show user-friendly message in production
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error calling keycloak.login:', error)
        }
        alert(`Login failed: ${error instanceof Error ? error.message : String(error)}\n\nPlease try again or contact support.`)
      }
    } else if (!isKeycloakEnabled) {
      alert('Keycloak is not configured. Set NEXT_PUBLIC_KEYCLOAK_URL and NEXT_PUBLIC_KEYCLOAK_CLIENT_ID in .env and restart the dev server.')
    } else if (isLoading) {
      // Still loading Keycloak
      return
    } else {
      // Keycloak not initialized - manually redirect with state + PKCE so callback can exchange code for token
      const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL
      const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'rentsetu'
      const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'rentsetu-client'
      
      if (typeof window !== 'undefined' && keycloakUrl) {
        const redirectUri = `${window.location.origin}/auth/callback`
        const state = createState()
        generatePkcePair()
          .then(({ codeVerifier, codeChallenge }) => {
            const callbackState = {
              state,
              redirectUri,
              pkceCodeVerifier: codeVerifier,
              expires: Date.now() + 60 * 60 * 1000,
            }
            try {
              localStorage.setItem(KC_CALLBACK_PREFIX + state, JSON.stringify(callbackState))
            } catch {
              // localStorage full or unavailable
            }
            const loginUrl =
              `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?` +
              `client_id=${encodeURIComponent(clientId)}&` +
              `redirect_uri=${encodeURIComponent(redirectUri)}&` +
              `response_type=code&` +
              `scope=openid&` +
              `response_mode=query&` +
              `state=${encodeURIComponent(state)}&` +
              `code_challenge=${encodeURIComponent(codeChallenge)}&` +
              `code_challenge_method=S256`
            if (process.env.NODE_ENV === 'development') {
              console.log('[Keycloak] Manual redirect with state + PKCE')
            }
            window.location.href = loginUrl
          })
          .catch(() => {
            // Fallback without PKCE if crypto.subtle unavailable (e.g. non-HTTPS)
            const callbackState = {
              state,
              redirectUri,
              expires: Date.now() + 60 * 60 * 1000,
            }
            try {
              localStorage.setItem(KC_CALLBACK_PREFIX + state, JSON.stringify(callbackState))
            } catch {
              /* ignore */
            }
            const loginUrl =
              `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?` +
              `client_id=${encodeURIComponent(clientId)}&` +
              `redirect_uri=${encodeURIComponent(redirectUri)}&` +
              `response_type=code&` +
              `scope=openid&` +
              `response_mode=query&` +
              `state=${encodeURIComponent(state)}`
            window.location.href = loginUrl
          })
      } else {
        const errorMsg = `Sign in is not ready yet.\n\nPlease check:\n` +
          `1. Keycloak server is accessible\n` +
          `2. Keycloak client configuration is correct\n` +
          `3. Try refreshing the page\n\n` +
          `If the problem persists, please contact support.`
        
        if (process.env.NODE_ENV === 'development') {
          console.warn('Login failed - Keycloak not initialized and cannot redirect:', {
            keycloak: keycloak,
            isKeycloakEnabled,
            isLoading,
            config: {
              url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
              realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
              clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
            }
          })
        }
        
        alert(errorMsg)
      }
    }
  }

  const logout = useCallback(() => {
    // Always clear app state first so UI updates immediately
    clearAuthCookie()
    setIsAuthenticated(false)
    setToken(null)
    setUser(null)

    if (typeof window === 'undefined') return

    if (keycloak && typeof keycloak.logout === 'function' && isKeycloakEnabled) {
      try {
        keycloak.logout({
          redirectUri: window.location.origin + '/',
        })
      } catch {
        window.location.href = '/'
      }
    } else {
      window.location.href = '/'
    }
  }, [keycloak, isKeycloakEnabled])

  // Only clear cookie once we've finished loading and user is not authenticated (don't clear on mount before init reads cookies)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) clearAuthCookie()
  }, [isLoading, isAuthenticated])

  return (
    <KeycloakContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        keycloak,
        login,
        logout,
        token,
        isKeycloakEnabled,
        user,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  )
}

export function useKeycloak(): KeycloakContextType {
  const context = useContext(KeycloakContext)
  if (context === undefined) {
    throw new Error('useKeycloak must be used within a KeycloakProvider')
  }
  return context
}
