import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy to Keycloak to avoid CORS when the app runs on a different origin (e.g. localhost:3000).
 * Set NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:3000/api/keycloak and KEYCLOAK_SERVER_URL=http://103.174.103.7:8081
 * so the browser talks to same-origin and this route forwards to Keycloak, rewriting URLs in JSON responses.
 */

const KEYCLOAK_SERVER = process.env.KEYCLOAK_SERVER_URL || process.env.NEXT_PUBLIC_KEYCLOAK_URL || ''

/** Origin the browser should use for proxy URLs (avoid 0.0.0.0:8080 when app runs in Docker). */
function getProxyOrigin(request: NextRequest): string {
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedProto && forwardedHost) {
    const origin = `${forwardedProto.replace(/,.*/, '').trim()}://${forwardedHost.replace(/,.*/, '').trim()}`
    if (origin.startsWith('http')) return origin
  }
  const origin = request.nextUrl.origin
  const isInternal = /^https?:\/\/(0\.0\.0\.0|127\.0\.0\.1|localhost)(:\d+)?$/i.test(origin)
  if (isInternal) {
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '')
    if (siteUrl && siteUrl.startsWith('http')) return siteUrl
  }
  return origin
}

function buildKeycloakUrl(path: string[], request: NextRequest): string {
  const base = KEYCLOAK_SERVER.replace(/\/$/, '')
  const pathStr = path.length ? path.join('/') : ''
  const search = request.nextUrl.searchParams.toString()
  const q = search ? `?${search}` : ''
  return `${base}/${pathStr}${q}`
}

function rewriteKeycloakUrlsInJson(json: string, proxyBase: string): string {
  if (!KEYCLOAK_SERVER) return json
  const serverBase = KEYCLOAK_SERVER.replace(/\/$/, '')
  return json.replace(new RegExp(serverBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), proxyBase)
}

/** Rewrite Keycloak HTML so form actions and asset URLs go through the proxy (same origin). */
function rewriteKeycloakUrlsInHtml(html: string, proxyOrigin: string, proxyPathPrefix: string): string {
  const proxyBase = `${proxyOrigin}${proxyPathPrefix}`
  let out = html
  if (KEYCLOAK_SERVER) {
    const serverBase = KEYCLOAK_SERVER.replace(/\/$/, '')
    out = out.replace(new RegExp(serverBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), proxyBase)
  }
  // Relative Keycloak paths must be requested via proxy so they don't 404 on the app
  out = out.replace(/(["'])(\/resources\/)/g, `$1${proxyPathPrefix}$2`)
  out = out.replace(/(["'])(\/realms\/)/g, `$1${proxyPathPrefix}$2`)
  // Ensure form actions go through proxy (cookie is set for proxy path; POST to Keycloak direct = "Cookie not found")
  out = out.replace(
    /(<form[^>]+action=)(["'])([^"']+)(["'])/gi,
    (_full, prefix: string, openQ: string, actionUrl: string, closeQ: string) => {
      const u = actionUrl.trim()
      if (u.startsWith('http') && !u.includes(proxyPathPrefix)) {
        try {
          const url = new URL(u)
          const path = url.pathname + url.search
          return `${prefix}${openQ}${proxyOrigin}${proxyPathPrefix}${path.startsWith('/') ? path : '/' + path}${closeQ}`
        } catch {
          return _full
        }
      }
      return _full
    }
  )
  return out
}

function rewriteLocationHeader(location: string | null, proxyOrigin: string): string | null {
  if (!location || !KEYCLOAK_SERVER) return location
  const serverBase = KEYCLOAK_SERVER.replace(/\/$/, '')
  return location.replace(new RegExp(serverBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `${proxyOrigin}/api/keycloak`)
}

/** Build headers to send to Keycloak (forward Cookie so session is preserved) */
function keycloakRequestHeaders(request: NextRequest, contentType?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: request.headers.get('Accept') || 'application/json',
  }
  const cookie = request.headers.get('Cookie')
  if (cookie) headers.Cookie = cookie
  if (contentType) headers['Content-Type'] = contentType
  return headers
}

/** Rewrite Set-Cookie Path so cookies are sent for our proxy paths (e.g. Path=/realms -> Path=/api/keycloak/realms) */
function rewriteSetCookiePath(value: string, proxyPathPrefix: string): string {
  return value.replace(/\bPath=\/realms(\/|$)/gi, `Path=${proxyPathPrefix}/realms$1`)
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  if (!KEYCLOAK_SERVER) {
    return NextResponse.json({ error: 'KEYCLOAK_SERVER_URL not set' }, { status: 500 })
  }
  const url = buildKeycloakUrl(path, request)
  const proxyOrigin = getProxyOrigin(request)
  const proxyBase = `${proxyOrigin}/api/keycloak`
  try {
    const res = await fetch(url, {
      headers: keycloakRequestHeaders(request),
      cache: 'no-store',
      redirect: 'manual', // do not follow; we must forward 302 and Set-Cookie to the browser
    })
    const contentType = res.headers.get('Content-Type') || ''

    // Forward redirects so the browser gets Set-Cookie and follows via proxy
    if (res.status === 301 || res.status === 302 || res.status === 303 || res.status === 307 || res.status === 308) {
      const location = rewriteLocationHeader(res.headers.get('Location'), proxyOrigin)
      const headers = new Headers()
      if (location) headers.set('Location', location)
      const proxyPathPrefix = '/api/keycloak'
      res.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') headers.append(key, rewriteSetCookiePath(value, proxyPathPrefix))
      })
      return new NextResponse(null, { status: res.status, headers })
    }

    let body = await res.text()
    if (res.ok) {
      if (contentType.includes('application/json')) {
        body = rewriteKeycloakUrlsInJson(body, proxyBase)
      } else if (contentType.includes('text/html')) {
        body = rewriteKeycloakUrlsInHtml(body, proxyOrigin, '/api/keycloak')
      }
    }
    const proxyPathPrefix = '/api/keycloak'
    const responseHeaders = new Headers()
    responseHeaders.set('Content-Type', contentType || 'application/json')
    res.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        responseHeaders.append(key, rewriteSetCookiePath(value, proxyPathPrefix))
      }
    })
    return new NextResponse(body, {
      status: res.status,
      headers: responseHeaders,
    })
  } catch (e) {
    console.error('[keycloak proxy] GET failed:', url, e)
    return NextResponse.json(
      { error: 'Keycloak proxy request failed', details: e instanceof Error ? e.message : String(e) },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  if (!KEYCLOAK_SERVER) {
    return NextResponse.json({ error: 'KEYCLOAK_SERVER_URL not set' }, { status: 500 })
  }
  const url = buildKeycloakUrl(path, request)
  const proxyOrigin = getProxyOrigin(request)
  const proxyBase = `${proxyOrigin}/api/keycloak`
  try {
    const contentType = request.headers.get('Content-Type') || 'application/x-www-form-urlencoded'
    const body = await request.text()
    const res = await fetch(url, {
      method: 'POST',
      headers: keycloakRequestHeaders(request, contentType),
      body,
      cache: 'no-store',
      redirect: 'manual',
    })
    // Forward redirects (e.g. after login) so browser gets Set-Cookie and follows via proxy
    if (res.status === 301 || res.status === 302 || res.status === 303 || res.status === 307 || res.status === 308) {
      const location = rewriteLocationHeader(res.headers.get('Location'), proxyOrigin)
      const headers = new Headers()
      if (location) headers.set('Location', location)
      const proxyPathPrefix = '/api/keycloak'
      res.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') headers.append(key, rewriteSetCookiePath(value, proxyPathPrefix))
      })
      return new NextResponse(null, { status: res.status, headers })
    }

    const resContentType = res.headers.get('Content-Type') || 'application/json'
    let resBody = await res.text()
    if (res.ok && resContentType.includes('application/json')) {
      resBody = rewriteKeycloakUrlsInJson(resBody, proxyBase)
    }
    return new NextResponse(resBody, {
      status: res.status,
      headers: { 'Content-Type': resContentType },
    })
  } catch (e) {
    console.error('[keycloak proxy] POST failed:', url, e)
    return NextResponse.json(
      { error: 'Keycloak proxy request failed', details: e instanceof Error ? e.message : String(e) },
      { status: 502 }
    )
  }
}
