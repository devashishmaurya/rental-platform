import { NextRequest, NextResponse } from 'next/server'
import { TOKEN_COOKIE, USER_COOKIE } from '@/lib/auth/constants'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

/** Callback URL path — must match Google Cloud Console "Authorized redirect URIs". */
export const GOOGLE_CALLBACK_PATH = '/api/auth/callback/google'

/**
 * Decode JWT payload without verification (backend must verify).
 * Used only to read name/email for user cookie.
 */
function decodeJwtPayload(token: string): { name?: string; email?: string; given_name?: string; family_name?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    return JSON.parse(decoded) as { name?: string; email?: string; given_name?: string; family_name?: string }
  } catch {
    return null
  }
}

/**
 * GET /api/auth/callback/google — Exchange code for tokens and set cookie, then redirect.
 * Same cookie names as Keycloak so middleware and API client work for both IdPs.
 *
 * In Google Cloud Console, set Authorized redirect URI to:
 *   Local:  http://localhost:3000/api/auth/callback/google
 *   Prod:   https://yourdomain.com/api/auth/callback/google
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const errorParam = request.nextUrl.searchParams.get('error')

  const origin = request.nextUrl.origin
  const redirectUri = `${origin}${GOOGLE_CALLBACK_PATH}`
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  let redirectTo = '/dashboard'
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as { redirect?: string }
      if (decoded?.redirect) redirectTo = decoded.redirect
    } catch {
      /* ignore */
    }
  }

  if (errorParam) {
    return NextResponse.redirect(`${origin}/auth/login?error=google_denied`)
  }

  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/auth/login?error=google_config`)
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    console.error('[google/callback] token exchange failed:', tokenRes.status, text)
    return NextResponse.redirect(`${origin}/auth/login?error=google_token`)
  }

  const tokens = (await tokenRes.json()) as { id_token?: string; access_token?: string; refresh_token?: string; expires_in?: number }
  const idToken = tokens.id_token || tokens.access_token
  if (!idToken) {
    return NextResponse.redirect(`${origin}/auth/login?error=google_token`)
  }

  const payload = decodeJwtPayload(idToken)
  const name = payload?.name || [payload?.given_name, payload?.family_name].filter(Boolean).join(' ') || payload?.email || 'User'
  const userPayload = {
    name,
    email: payload?.email,
    preferred_username: payload?.email,
    authenticated: true,
  }

  const isProd = process.env.NODE_ENV === 'production'
  const maxAge = 60 * 60 * 24 // 24h

  const res = NextResponse.redirect(`${origin}${redirectTo}`)
  res.cookies.set(TOKEN_COOKIE, idToken, {
    path: '/',
    maxAge,
    sameSite: isProd ? 'lax' : 'lax',
    secure: isProd,
    httpOnly: false,
  })
  res.cookies.set(USER_COOKIE, JSON.stringify(userPayload), {
    path: '/',
    maxAge,
    sameSite: isProd ? 'lax' : 'lax',
    secure: isProd,
    httpOnly: false,
  })

  return res
}
