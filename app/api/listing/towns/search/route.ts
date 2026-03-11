import { NextRequest, NextResponse } from 'next/server'

const TOWNS_SEARCH_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/listing/v1.0/towns/search`
  : ''

/**
 * Proxy for GET /api/listing/v1.0/towns/search?keyword=... — location type-ahead (OpenRent-style).
 * Returns suggestions for the homepage and search page location field.
 */
export async function GET(request: NextRequest) {
  if (!TOWNS_SEARCH_BASE) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_URL not configured' },
      { status: 503 }
    )
  }

  const keyword = request.nextUrl.searchParams.get('keyword') ?? ''
  const url = `${TOWNS_SEARCH_BASE}?keyword=${encodeURIComponent(keyword)}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'Towns search API error', status: res.status, detail: text },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/listing/towns/search] fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch location suggestions', detail: String(err) },
      { status: 502 }
    )
  }
}
