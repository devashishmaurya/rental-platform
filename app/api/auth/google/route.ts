import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const SCOPES = ['openid', 'email', 'profile'].join(' ')

/**
 * GET /api/auth/google — Redirect to Google OAuth consent.
 * Query: redirect (optional) — path to redirect after login (e.g. /dashboard).
 * Sets token in cookie via callback route; same cookie name as Keycloak for middleware/API.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    const origin = request.nextUrl.origin
    return NextResponse.redirect(`${origin}/auth/login?error=google_config`)
  }

  const redirect = request.nextUrl.searchParams.get('redirect') || '/dashboard'
  const origin = request.nextUrl.origin
  // Must match Google Cloud Console "Authorized redirect URIs": e.g. http://localhost:3000/api/auth/callback/google
  const redirectUri = `${origin}/api/auth/callback/google`

  const state = Buffer.from(JSON.stringify({ redirect }), 'utf8').toString('base64url')
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

  const url = `${GOOGLE_AUTH_URL}?${params.toString()}`
  return NextResponse.redirect(url)
}
