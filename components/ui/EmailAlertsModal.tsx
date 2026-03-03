'use client'

import { useState } from 'react'
import { useApiClient } from '@/lib/api/useApiClient'

export interface AlertFilters {
  minRent?: number
  maxRent?: number
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  furnishing?: string
  propertyType?: string
  moveInBefore?: string
  maxFixedTerm?: number
  acceptFamilies?: boolean
  acceptStudents?: boolean
  petsAllowed?: boolean
  smokersAllowed?: boolean
  hasFireplace?: boolean
  onlyAvailable?: boolean
  hideEnquired?: boolean
  sortBy?: string
}

interface CreateAlertPayload {
  userId?: number
  alertName: string
  location: string
  radiusKm: number
  filters: AlertFilters
}

interface SearchState {
  location: string
  radiusKm: number
  priceFilter: string
  bedsFilter: string
}

interface EmailAlertsModalProps {
  open: boolean
  onClose: () => void
  searchState: SearchState
  onCreateSuccess?: () => void
}

/** Map price filter value (e.g. "15000-30000") to min/max rent for API */
function priceFilterToRent(priceFilter: string): { minRent?: number; maxRent?: number } {
  if (!priceFilter || priceFilter === 'any') return {}
  const [minStr, maxStr] = priceFilter.split('-').map((s) => s.trim())
  const min = minStr ? parseInt(minStr, 10) : undefined
  const max = maxStr ? parseInt(maxStr, 10) : undefined
  if (Number.isNaN(min) && Number.isNaN(max)) return {}
  return {
    minRent: Number.isNaN(min) ? undefined : min,
    maxRent: Number.isNaN(max) || max === 0 ? undefined : max,
  }
}

/** Build createAlert filters from current search state */
function buildFiltersFromSearch(state: SearchState): AlertFilters {
  const { minRent, maxRent } = priceFilterToRent(state.priceFilter)
  const minBedrooms = state.bedsFilter && state.bedsFilter !== 'any' ? parseInt(state.bedsFilter, 10) : undefined
  const filters: AlertFilters = {
    minRent,
    maxRent,
    minBedrooms: minBedrooms !== undefined && !Number.isNaN(minBedrooms) ? minBedrooms : undefined,
    furnishing: 'FURNISHED_OR_UNFURNISHED',
    propertyType: 'HOUSE',
    onlyAvailable: true,
    hideEnquired: false,
    sortBy: 'PRICE_HIGH_TO_LOW',
  }
  return filters
}

/** Modal for creating an email alert from the current search. Manage alerts is on Dashboard → Saved Searches. */
export function EmailAlertsModal({
  open,
  onClose,
  searchState,
  onCreateSuccess,
}: EmailAlertsModalProps) {
  const api = useApiClient()
  const [alertName, setAlertName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    const location = searchState.location.trim() || 'Any location'
    const name = alertName.trim() || `Alert: ${location}`
    setLoading(true)
    try {
      const filters = buildFiltersFromSearch(searchState)
      const payload: CreateAlertPayload = {
        alertName: name,
        location,
        radiusKm: searchState.radiusKm,
        filters,
      }
      await api.post('/api/alerts/createAlert', payload, { baseURL: '' })
      setSuccessMessage('Email alert created. You’ll get new properties matching this search.')
      setAlertName('')
      onCreateSuccess?.()
      setTimeout(() => {
        setSuccessMessage(null)
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Create email alert</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-red-800 text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-green-800 text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleCreateAlert} className="space-y-4">
            <p className="text-gray-600 text-sm">
              Get new properties matching your current search (location, radius, price, beds) by email.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert name (optional)</label>
              <input
                type="text"
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
                placeholder={searchState.location.trim() || 'e.g. London budget houses'}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="text-sm text-gray-500">
              Location: <span className="font-medium text-gray-700">{searchState.location.trim() || 'Any'}</span>
              {' · '}
              Radius: <span className="font-medium text-gray-700">{searchState.radiusKm} km</span>
              {searchState.priceFilter !== 'any' && (
                <> · Price filter applied</>
              )}
              {searchState.bedsFilter !== 'any' && (
                <> · Min beds: {searchState.bedsFilter}</>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent-green hover:bg-accent-green-hover text-white font-semibold py-3 px-4 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Create email alert
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
