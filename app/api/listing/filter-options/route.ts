import { NextRequest, NextResponse } from 'next/server'

const FILTER_OPTIONS_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/listing/filter-options`
  : ''

/**
 * Proxy for GET /api/listing/filter-options?field=... — forwards to backend.
 * Supported fields: property_type, furnishing, BEDROOMS, BATHROOMS, TOWN, EPC_RATING
 */
export async function GET(request: NextRequest) {
  if (!FILTER_OPTIONS_URL) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_URL not configured' },
      { status: 503 }
    )
  }

  const field = request.nextUrl.searchParams.get('field') ?? ''
  const url = `${FILTER_OPTIONS_URL}?field=${encodeURIComponent(field)}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'Filter options API error', status: res.status, detail: text },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/listing/filter-options] fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch filter options', detail: String(err) },
      { status: 502 }
    )
  }
}
