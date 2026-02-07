/**
 * Auth cookie names and client-safe helpers.
 * Safe to import from client components (no next/headers).
 */

export const TOKEN_COOKIE = 'keycloak-token'
export const USER_COOKIE = 'user'

/**
 * Client-side only: read token from cookie.
 * For client components prefer useKeycloak().token for live updates.
 */
export function getClientToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
