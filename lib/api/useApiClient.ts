'use client'

import { useKeycloak } from '@/lib/auth/keycloak'
import { useMemo } from 'react'
import { apiClient, getBaseURL } from './client'

/**
 * Hook that returns the API client with auth token attached (for use in client components).
 * Usage: const api = useApiClient(); await api.get('/path'); await api.post('/path', body);
 */
export function useApiClient() {
  const { token } = useKeycloak()
  return useMemo(
    () => ({
      get: <T = unknown>(endpoint: string, options?: { headers?: HeadersInit; baseURL?: string }) =>
        apiClient.get<T>(endpoint, { 
          getToken: () => token, 
          baseURL: options?.baseURL !== undefined ? options.baseURL : getBaseURL(), 
          headers: options?.headers 
        }),
      post: <T = unknown>(
        endpoint: string,
        data?: unknown,
        options?: { headers?: HeadersInit; baseURL?: string }
      ) =>
        apiClient.post<T>(endpoint, data, {
          getToken: () => token,
          baseURL: options?.baseURL !== undefined ? options.baseURL : getBaseURL(),
          headers: options?.headers,
        }),
      put: <T = unknown>(
        endpoint: string,
        data?: unknown,
        options?: { headers?: HeadersInit; baseURL?: string }
      ) =>
        apiClient.put<T>(endpoint, data, {
          getToken: () => token,
          baseURL: options?.baseURL !== undefined ? options.baseURL : getBaseURL(),
          headers: options?.headers,
        }),
      delete: <T = unknown>(endpoint: string, options?: { headers?: HeadersInit; baseURL?: string }) =>
        apiClient.delete<T>(endpoint, {
          getToken: () => token,
          baseURL: options?.baseURL !== undefined ? options.baseURL : getBaseURL(),
          headers: options?.headers,
        }),
    }),
    [token]
  )
}
