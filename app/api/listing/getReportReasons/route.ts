import { NextResponse } from 'next/server'

const REPORT_REASONS_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/listing/v1.0/getReportReasons`
  : ''

/**
 * Proxy for GET /api/listing/v1.0/getReportReasons — master categories for Report Property.
 */
export async function GET() {
  if (!REPORT_REASONS_URL) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_URL not configured' },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(REPORT_REASONS_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(data || { error: 'getReportReasons API error' }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/listing/getReportReasons] fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch report reasons', detail: String(err) },
      { status: 502 }
    )
  }
}
