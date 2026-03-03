import { NextResponse } from 'next/server'

const USERREVIEWS_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/v1.0/userreviews`
  : ''

/**
 * Proxy for POST /api/userreviews — forwards to external API server-side to avoid CORS.
 * Same pattern as /api/packages. Backend expects POST with empty payload.
 */
export async function POST() {
  if (!USERREVIEWS_URL) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_URL not configured' },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(USERREVIEWS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({}),
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'User reviews API error', status: res.status, detail: text },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/userreviews] fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch user reviews', detail: String(err) },
      { status: 502 }
    )
  }
}
