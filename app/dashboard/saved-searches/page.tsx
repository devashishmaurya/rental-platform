'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useApiClient } from '@/lib/api/useApiClient'

type AlertStatus = 'ACTIVE' | 'PAUSED' | 'DELETED'

interface AlertFilters {
  minRent?: number
  maxRent?: number
  minBedrooms?: number
  maxBedrooms?: number
  acceptFamilies?: boolean
  acceptStudents?: boolean
  petsAllowed?: boolean
  smokersAllowed?: boolean
  hasFireplace?: boolean
  [key: string]: unknown
}

interface AlertItem {
  id: number
  alertName?: string
  location?: string
  radiusKm?: number
  status?: AlertStatus | string
  userId?: number
  filters?: AlertFilters
  [key: string]: unknown
}

/** Build search URL from alert (location, radius, price, beds) for "View Properties" */
function buildSearchUrl(alert: AlertItem): string {
  const params = new URLSearchParams()
  const location = alert.location?.trim() || ''
  const radius = alert.radiusKm ?? 10
  const f = alert.filters ?? {}
  if (location) params.set('q', location)
  if (radius) params.set('radius', String(radius))
  if (typeof f.minRent === 'number' && f.minRent > 0) params.set('minRent', String(f.minRent))
  if (typeof f.maxRent === 'number' && f.maxRent > 0) params.set('maxRent', String(f.maxRent))
  if (typeof f.minBedrooms === 'number' && f.minBedrooms > 0) params.set('minBedrooms', String(f.minBedrooms))
  const query = params.toString()
  return query ? `/search?${query}` : '/search'
}

/** Human-readable price range from filters */
function formatPriceRange(f?: AlertFilters): string {
  if (!f) return 'Any'
  const min = f.minRent ?? 0
  const max = f.maxRent ?? 0
  if (min === 0 && max === 0) return 'Any'
  if (min > 0 && max === 0) return `₹${min.toLocaleString('en-IN')}+`
  if (min === 0 && max > 0) return `Up to ₹${max.toLocaleString('en-IN')}`
  return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`
}

/** Human-readable bedrooms from filters */
function formatBedrooms(f?: AlertFilters): string {
  if (!f) return 'Any'
  const min = f.minBedrooms ?? 0
  const max = f.maxBedrooms ?? 0
  if (min === 0 && max === 0) return 'Any'
  if (min > 0 && (max === 0 || max >= 10)) return `Over ${min} bed${min === 1 ? '' : 's'}`
  if (min > 0 && max > 0 && max < 10) return `${min} - ${max} beds`
  return min > 0 ? `${min}+ beds` : 'Any'
}

/** Summary of other restrictions (DSS/Students/Pets etc.) */
function formatOtherRestrictions(f?: AlertFilters): string {
  if (!f) return 'No other restrictions set (DSS / Students / Pets Allowed / etc.)'
  const parts: string[] = []
  if (f.acceptFamilies) parts.push('Families allowed')
  if (f.acceptStudents) parts.push('Students allowed')
  if (f.petsAllowed) parts.push('Pets allowed')
  if (f.smokersAllowed) parts.push('Smokers allowed')
  if (f.hasFireplace) parts.push('Fireplace')
  if (parts.length === 0) return 'No other restrictions set (DSS / Students / Pets Allowed / etc.)'
  return parts.join(' · ')
}

export default function SavedSearchesPage() {
  const api = useApiClient()
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.post<{
        responseMessage?: { responseData?: AlertItem[] }
        alerts?: AlertItem[]
      }>('/api/alerts/getAlerts', {}, { baseURL: '' })
      const list =
        (data as { responseMessage?: { responseData?: AlertItem[] } })?.responseMessage?.responseData ??
        (data as { alerts?: AlertItem[] })?.alerts ??
        []
      setAlerts(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved searches')
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const handleManageAlert = async (alertId: number, status: AlertStatus) => {
    setError(null)
    try {
      await api.post('/api/alerts/manageAlert', { id: alertId, status }, { baseURL: '' })
      if (status === 'DELETED') {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId))
      } else {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, status } : a))
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert')
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h1 className="text-xl font-semibold text-gray-900">Saved Searches</h1>
      <p className="mt-2 text-gray-600">
        Here you can manage your email search alerts.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900">Search Alerts</h2>
        <p className="mt-1 text-sm text-gray-600">
          We will email you once a day showing you all the new properties matching your search criteria, as specified below:
        </p>

        {loading ? (
          <p className="mt-4 text-gray-500">Loading saved searches...</p>
        ) : alerts.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No saved searches yet.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {alerts.map((alert) => {
              const status = String(alert.status ?? 'ACTIVE').toUpperCase()
              const isActive = status === 'ACTIVE'
              const searchUrl = buildSearchUrl(alert)
              const f = alert.filters

              return (
                <li
                  key={alert.id}
                  className="rounded-xl border border-gray-200 p-5 relative"
                >
                  {/* Edit & Delete icons - top right */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <Link
                      href={searchUrl}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg inline-flex"
                      title="Edit search"
                      aria-label="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleManageAlert(alert.id, 'DELETED')}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      title="Delete alert"
                      aria-label="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Status pill */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 pr-24">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        isActive
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  {/* Criteria */}
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-medium text-gray-900">Location & radius:</span>{' '}
                      Within {alert.radiusKm ?? 10}km of {alert.location || 'Any location'}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Price:</span>{' '}
                      {formatPriceRange(f)}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Bedrooms:</span>{' '}
                      {formatBedrooms(f)}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Other:</span>{' '}
                      {formatOtherRestrictions(f)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={searchUrl}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      View Properties
                    </Link>
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => handleManageAlert(alert.id, 'PAUSED')}
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium px-4 py-2.5 text-sm hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pause Alerts
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleManageAlert(alert.id, 'ACTIVE')}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Resume Alerts
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {/* CTA */}
        <div className="mt-8 rounded-lg bg-gray-50 border border-gray-100 p-5">
          <p className="text-sm text-gray-700">
            To add more search alerts, just start a new search. On the search results page, you can save the search and it will appear here.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent-green hover:bg-accent-green-hover text-white font-semibold px-4 py-2.5 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Start a new search
          </Link>
        </div>
      </section>
    </div>
  )
}
