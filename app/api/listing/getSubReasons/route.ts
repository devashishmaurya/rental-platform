import { NextRequest, NextResponse } from 'next/server'

const SUB_REASONS_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/listing/v1.0/getSubReasons`
  : ''

/**
 * Proxy for POST /api/listing/v1.0/getSubReasons — sub-reasons for a selected report reason (body: { id: reasonId }).
 */
export async function POST(request: NextRequest) {
  if (!SUB_REASONS_URL) {
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
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const res = await fetch(SUB_REASONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(data || { error: 'getSubReasons API error' }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/listing/getSubReasons] fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch sub-reasons', detail: String(err) },
      { status: 502 }
    )
  }
}
