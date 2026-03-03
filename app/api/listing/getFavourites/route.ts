import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { TOKEN_COOKIE } from '@/lib/auth/constants'

const GET_FAVOURITES_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/listing/v1.0/getAllfavourite`
  : ''

/** Proxy for POST /api/listing/getFavourites — returns list of favourited properties. */
export async function POST(request: Request) {
  if (!GET_FAVOURITES_URL) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_URL not configured' },
      { status: 503 }
    )
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_COOKIE)?.value

  let body: unknown = {}
  try {
    const parsed = await request.json().catch(() => ({}))
    if (parsed !== undefined && parsed !== null) body = parsed
  } catch {
    /* empty body */
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(GET_FAVOURITES_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(data || { error: 'Get favourites API error' }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/listing/getFavourites] fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to get favourites', detail: String(err) },
      { status: 502 }
    )
  }
}
