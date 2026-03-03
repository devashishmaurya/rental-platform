/**
 * Auth cookie names and client-safe helpers.
 * Safe to import from client components (no next/headers).
 */

export const TOKEN_COOKIE = 'keycloak-token'
export const REFRESH_TOKEN_COOKIE = 'keycloak-refresh-token'
export const USER_COOKIE = 'user'

/** localStorage key for full user object (name, preferred_username, email, etc.) */
export const USER_STORAGE_KEY = 'user_details'
/** localStorage key for display name only (convenience) */
export const USER_NAME_STORAGE_KEY = 'user_name'

/**
 * Client-side only: read token from cookie.
 * For client components prefer useKeycloak().token for live updates.
 */
export function getClientToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/** Client-side only: read refresh token from cookie (for session restore). */
export function getClientRefreshToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${REFRESH_TOKEN_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/** Client-side only: read user from cookie (JSON). Prefer useKeycloak().user for live updates. */
export function getClientUser(): { name?: string; preferred_username?: string; [key: string]: unknown } | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${USER_COOKIE}=([^;]*)`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1])) as { name?: string; preferred_username?: string; [key: string]: unknown }
  } catch {
    return null
  }
}

/** Client-side only: read user from localStorage (same shape as cookie). */
export function getClientUserFromStorage(): { name?: string; preferred_username?: string; [key: string]: unknown } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as { name?: string; preferred_username?: string; [key: string]: unknown }) : null
  } catch {
    return null
  }
}

/** Client-side only: read display name from localStorage. */
export function getClientUserName(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_NAME_STORAGE_KEY)
}
