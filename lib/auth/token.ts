/**
 * Server-only token & user access (Server Components, API routes, Server Actions).
 * Do not import this file from client components — use lib/auth/constants.ts for cookie names.
 */

import { cookies } from 'next/headers'
import { TOKEN_COOKIE, USER_COOKIE } from './constants'

/**
 * Server-side: get token from cookie (set by client after Keycloak login).
 */
export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null
}

/**
 * Server-side: get parsed user from cookie (if you persist user data in cookie).
 */
export async function getUser(): Promise<{ authenticated?: boolean; [key: string]: unknown } | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(USER_COOKIE)?.value
  if (!value) return null
  try {
    return JSON.parse(value) as { authenticated?: boolean; [key: string]: unknown }
  } catch {
    return null
  }
}
