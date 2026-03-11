import { NextRequest, NextResponse } from 'next/server'

const LISTING_VIEW_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/listing/v1.0/view`
  : ''

/**
 * Proxy for POST /api/listing/view — forwards to external API server-side to avoid CORS.
 * Body is forwarded as-is. Backend accepts:
 * - {} or { startRow, endRow } for list view
 * - { location: string } for location/term filter (from search bar or ?term=)
 * - { id: number } for single property (no startRow/endRow)
 * - filters: minRent, maxRent, minBedrooms, propertyType, furnishing, town, epcRating, etc.
 */
export async function POST(request: NextRequest) {
  if (!LISTING_VIEW_URL) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_URL not configured' },
      { status: 503 }
    )
  }

  let body: Record<string, unknown> = {}
  try {
    const parsed = await request.json().catch(() => ({}))
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      body = parsed as Record<string, unknown>
    }
  } catch {
    /* use empty body */
  }

  try {
    const res = await fetch(LISTING_VIEW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'View listing API error', status: res.status, detail: text },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/listing/view] fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch listings', detail: String(err) },
      { status: 502 }
    )
  }
}
