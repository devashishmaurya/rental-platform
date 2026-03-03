/**
 * API client with request/response interceptors (per High-Level & Next.js auth docs).
 * - Request: attach auth token (AuthInterceptor equivalent).
 * - Response: handle 401/403 and redirect (ErrorInterceptor equivalent).
 * Use getToken from useKeycloak() when calling from client components.
 */

const DEFAULT_BASE = ''

export type ApiClientOptions = {
  baseURL?: string
  getToken?: () => string | null
}

/**
 * Centralized error handling (ErrorInterceptor equivalent).
 * 401 -> redirect to login; 403 -> redirect to /error/403; else throw.
 */
async function handleErrorResponse(response: Response): Promise<never> {
  const error = await response.json().catch(() => ({})) as { errorData?: { errorCode?: string; errorMessage?: string } }
  const code = error?.errorData?.errorCode
  const message = error?.errorData?.errorMessage ?? 'Request failed'

  if (response.status === 401) {
    if (code === 'NCAUTH0027' && typeof window !== 'undefined') {
      window.location.href = '/auth/otp'
      return await new Promise(() => {})
    }
    if (typeof window !== 'undefined') {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/auth/login?redirect=${redirect}`
      return await new Promise(() => {})
    }
    throw new Error('Unauthorized')
  }

  if (response.status === 403) {
    if (typeof window !== 'undefined') {
      window.location.href = '/error/403'
      return await new Promise(() => {})
    }
    throw new Error('Forbidden')
  }

  if (response.status >= 500) {
    throw new Error(message || 'Server error')
  }

  throw new Error(message)
}

/**
 * Low-level request with token attachment and error handling.
 * Automatically includes cookies (credentials: 'include') and Authorization header.
 */
async function request(
  endpoint: string,
  options: RequestInit & { getToken?: () => string | null; baseURL?: string } = {}
): Promise<Response> {
  const { getToken, baseURL = DEFAULT_BASE, ...init } = options
  const url = endpoint.startsWith('http') ? endpoint : `${baseURL.replace(/\/$/, '')}${endpoint}`
  
  // Log the request for debugging (only in development)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[API Client] Making request:', {
      method: init.method || 'GET',
      url,
      endpoint,
      baseURL,
      hasToken: !!getToken?.(),
    })
  }
  
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  // Add token to request header
  const token = getToken?.()
  if (token) {
    headers.set('token', token)
  }

  // Always include credentials (cookies) with requests
  // This ensures the keycloak-token cookie is automatically sent with all API calls
  const response = await fetch(url, {
    ...init,
    headers,
    credentials: 'include', // Automatically sends cookies (including keycloak-token) with all requests
  })
  if (!response.ok) await handleErrorResponse(response)
  return response
}

/**
 * Common API methods (GET, POST, PUT, DELETE) with optional token getter.
 * Use from client: apiClient.get('/path', { getToken: () => useKeycloak().token ?? null }).
 * Use from server: pass getToken that reads from cookies (see lib/auth/token.ts).
 */
export const apiClient = {
  async get<T = unknown>(
    endpoint: string,
    options: { getToken?: () => string | null; baseURL?: string; headers?: HeadersInit } = {}
  ): Promise<T> {
    const res = await request(endpoint, { method: 'GET', ...options })
    return res.headers.get('content-type')?.includes('json') ? res.json() : (res.text() as Promise<T>)
  },

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: { getToken?: () => string | null; baseURL?: string; headers?: HeadersInit } = {}
  ): Promise<T> {
    const res = await request(endpoint, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
      ...options,
    })
    return res.headers.get('content-type')?.includes('json') ? res.json() : (res.text() as Promise<T>)
  },

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: { getToken?: () => string | null; baseURL?: string; headers?: HeadersInit } = {}
  ): Promise<T> {
    const res = await request(endpoint, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
      ...options,
    })
    return res.headers.get('content-type')?.includes('json') ? res.json() : (res.text() as Promise<T>)
  },

  async delete<T = unknown>(
    endpoint: string,
    options: { getToken?: () => string | null; baseURL?: string; headers?: HeadersInit } = {}
  ): Promise<T> {
    const res = await request(endpoint, { method: 'DELETE', ...options })
    return res.headers.get('content-type')?.includes('json') ? res.json() : (res.text() as Promise<T>)
  },
}

export const getBaseURL = () => process.env.NEXT_PUBLIC_API_URL ?? ''
