import { NextRequest, NextResponse } from 'next/server'

const GET_SERVICE_BY_ID_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/service/v1.0/getServiceById`
  : ''

/**
 * Proxy for POST /api/service/getServiceById — forwards to external API server-side to avoid CORS.
 * Body: { id: string } (service UUID).
 * Returns backend response (responseMessage.responseData = service with attributes).
 */
export async function POST(request: NextRequest) {
  if (!GET_SERVICE_BY_ID_URL) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_URL not configured' },
      { status: 503 }
    )
  }

  let body: { id?: string } = {}
  try {
    const parsed = await request.json().catch(() => ({}))
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'id' in parsed) {
      body = parsed as { id: string }
    }
  } catch {
    /* use empty body */
  }

  try {
    const res = await fetch(GET_SERVICE_BY_ID_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'Get service by ID API error', status: res.status, detail: text },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/service/getServiceById] fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch service', detail: String(err) },
      { status: 502 }
    )
  }
}
