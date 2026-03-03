import { NextResponse } from 'next/server'

const PACKAGES_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/v1.0/packages`
  : ''

/**
 * Proxy for GET /api/packages — fetches from external API server-side to avoid CORS.
 * Browser calls this same-origin; Next.js proxies to backend using NEXT_PUBLIC_API_URL.
 */
export async function GET() {
  if (!PACKAGES_URL) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_URL not configured' },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(PACKAGES_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 }, // cache 1 minute
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'Packages API error', status: res.status, detail: text },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/packages] fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch packages', detail: String(err) },
      { status: 502 }
    )
  }
}
