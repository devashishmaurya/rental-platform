import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { TOKEN_COOKIE } from '@/lib/auth/constants'

const IS_FAVOURITE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/listing/v1.0/isFavourite`
  : ''

/** Proxy for POST /api/listing/isFavourite — forwards to backend with auth token. */
export async function POST(request: Request) {
  if (!IS_FAVOURITE_URL) {
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
    const res = await fetch(IS_FAVOURITE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(data || { error: 'Is favourite API error' }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/listing/isFavourite] fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to check favourite', detail: String(err) },
      { status: 502 }
    )
  }
}
