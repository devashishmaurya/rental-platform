'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { TOKEN_COOKIE, USER_COOKIE } from './constants'

/** Set auth cookie so middleware can enforce auth guard (server cannot read Keycloak state). */
function setAuthCookie(token: string | null, userInfo?: unknown) {
  if (typeof document === 'undefined') return
  const isProd = process.env.NODE_ENV === 'production'
  const opts = `path=/; max-age=${token ? 60 * 60 * 24 : 0}; SameSite=Lax${isProd ? '; Secure' : ''}`
  document.cookie = token ? `${TOKEN_COOKIE}=${encodeURIComponent(token)}; ${opts}` : `${TOKEN_COOKIE}=; ${opts}`
  if (userInfo != null) {
    document.cookie = `${USER_COOKIE}=${encodeURIComponent(JSON.stringify({ ...(userInfo as object), authenticated: !!token }))}; ${opts}`
  }
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return
  const opts = 'path=/; max-age=0; SameSite=Lax'
  document.cookie = `${TOKEN_COOKIE}=; ${opts}`
  document.cookie = `${USER_COOKIE}=; ${opts}`
}

// Check if Keycloak is configured
const isKeycloakConfigured = () => {
  if (typeof window === 'undefined') return false
  const url = process.env.NEXT_PUBLIC_KEYCLOAK_URL
  return !!url && url !== 'http://localhost:8080' && url !== ''
}

// Lazy load Keycloak only if configured
let Keycloak: any = null
if (typeof window !== 'undefined' && isKeycloakConfigured()) {
  try {
    Keycloak = require('keycloak-js').default
  } catch (error) {
    console.warn('Keycloak package not installed. Install with: npm install keycloak-js')
  }
}

interface KeycloakContextType {
  isAuthenticated: boolean
  isLoading: boolean
  keycloak: any
  login: () => void
  logout: () => void
  token: string | null
  isKeycloakEnabled: boolean
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined)

interface KeycloakProviderProps {
  children: ReactNode
}

export function KeycloakProvider({ children }: KeycloakProviderProps) {
  const [keycloak, setKeycloak] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [isKeycloakEnabled, setIsKeycloakEnabled] = useState(false)

  useEffect(() => {
    // Check if Keycloak is configured
    const keycloakConfigured = isKeycloakConfigured()
    setIsKeycloakEnabled(keycloakConfigured)

    if (!keycloakConfigured || !Keycloak) {
      // Keycloak not configured - use mock/disabled mode
      console.log('Keycloak not configured. Running in development mode without authentication.')
      setIsLoading(false)
      setIsAuthenticated(false)
      return
    }

    // Initialize Keycloak only if configured
    const initKeycloak = async () => {
      try {
        const keycloakInstance = new Keycloak({
          url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
          realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'rental-platform',
          clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'rental-platform-client',
        })

        const authenticated = await keycloakInstance.init({
          onLoad: 'check-sso', // Check SSO status without redirecting
          checkLoginIframe: false,
          pkceMethod: 'S256',
        })

        setKeycloak(keycloakInstance)
        setIsAuthenticated(authenticated)
        const newToken = keycloakInstance.token || null
        setToken(newToken)
        setAuthCookie(newToken, keycloakInstance.userInfo)

        // Update token on refresh
        keycloakInstance.onTokenExpired = () => {
          keycloakInstance.updateToken(30).then((refreshed: boolean) => {
            if (refreshed) {
              const t = keycloakInstance.token || null
              setToken(t)
              setAuthCookie(t, keycloakInstance.userInfo)
            }
          })
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak:', error)
        console.log('Continuing without Keycloak authentication.')
      } finally {
        setIsLoading(false)
      }
    }

    initKeycloak()
  }, [])

  const login = () => {
    if (keycloak && isKeycloakEnabled) {
      const redirectUri =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : ''
      keycloak.login({ redirectUri })
    } else {
      // Mock login for development
      console.log('Keycloak not configured. Login functionality will be available after Keycloak setup.')
      alert('Keycloak authentication is not configured. Please set up Keycloak to enable login functionality.')
    }
  }

  const logout = useCallback(() => {
    clearAuthCookie()
    if (keycloak && isKeycloakEnabled) {
      keycloak.logout({
        redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
      })
    } else {
      setIsAuthenticated(false)
      setToken(null)
    }
  }, [keycloak, isKeycloakEnabled])

  useEffect(() => {
    if (!isAuthenticated) clearAuthCookie()
  }, [isAuthenticated])

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
