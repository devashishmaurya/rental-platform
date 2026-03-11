import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { TOKEN_COOKIE } from '@/lib/auth/constants'

const SUBMIT_REPORT_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/listing/v1.0/submitPropertyReport`
  : ''

/**
 * Proxy for POST /api/listing/v1.0/submitPropertyReport.
 * Body: propertyId, landlordId, reportedByUserId, reasonId, subReasonId, description?, attachments?
 */
export async function POST(request: NextRequest) {
  if (!SUBMIT_REPORT_URL) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_URL not configured' },
      { status: 503 }
    )
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_COOKIE)?.value

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(SUBMIT_REPORT_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(data || { error: 'submitPropertyReport API error' }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/listing/submitPropertyReport] fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to submit report', detail: String(err) },
      { status: 502 }
    )
  }
}
