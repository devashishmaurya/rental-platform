import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { TOKEN_COOKIE } from '@/lib/auth/constants'

const SEND_MESSAGE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/alerts/v1.0/sendMessage`
  : ''

/**
 * Proxy for POST /api/alerts/v1.0/sendMessage.
 * Body: propertyId, tenantId, landlordId, senderRole, subject, message (200 char limit).
 */
export async function POST(request: NextRequest) {
  if (!SEND_MESSAGE_URL) {
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
    const res = await fetch(SEND_MESSAGE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(data || { error: 'sendMessage API error' }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/alerts/sendMessage] fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to send message', detail: String(err) },
      { status: 502 }
    )
  }
}
