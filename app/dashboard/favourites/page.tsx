'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useApiClient } from '@/lib/api/useApiClient'

/** Listing item shape from getFavourites / view API */
interface FavouriteListing {
  id?: number
  houseNumber?: string | null
  addressLine2?: string | null
  addressLine3?: string | null
  town?: string | null
  postcode?: string | null
  description?: string | null
  monthlyRent?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  furnishing?: string | null
  propertyType?: string | null
  status?: string | null
  imageUrl?: string | null
  thumbnailUrl?: string | null
  [key: string]: unknown
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'property'
}

function propertyDetailHref(item: FavouriteListing): string {
  const id = item.id
  if (id == null) return '/search'
  const town = item.town?.trim() || ''
  const postcode = item.postcode?.trim() || ''
  const locationSlug = slugify(town || postcode || 'property')
  const type = item.propertyType?.trim() || 'property'
  const house = item.houseNumber?.trim() || ''
  const main = [house, town || postcode].filter(Boolean).join(' ')
  const slug = slugify([type, main].filter(Boolean).join(' ') || 'property')
  return `/property-to-rent/${locationSlug}/${slug}/${id}`
}

function buildTitle(item: FavouriteListing): string {
  const type = item.propertyType?.trim() || 'Property'
  const house = item.houseNumber?.trim() || ''
  const town = item.town?.trim() || ''
  const postcode = item.postcode?.trim() || ''
  const main = [house, town || postcode].filter(Boolean).join(', ') || type
  return main ? `${type}, ${main}` : type
}

export default function FavouritesPage() {
  const api = useApiClient()
  const [listings, setListings] = useState<FavouriteListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const fetchFavourites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.post<{
        responseMessage?: { responseData?: { properties?: FavouriteListing[] } }
      }>('/api/listing/getFavourites', {}, { baseURL: '' })
      const list =
        data?.responseMessage?.responseData?.properties ??
        (data as { properties?: FavouriteListing[] })?.properties ??
        []
      setListings(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favourites')
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    fetchFavourites()
  }, [fetchFavourites])

  const handleRemove = async (id: number) => {
    if (removingId != null) return
    setRemovingId(id)
    try {
      await api.post('/api/listing/removeFavourite', { id }, { baseURL: '' })
      setListings((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setError('Failed to remove from favourites')
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-xl font-semibold text-gray-900">Favourites</h1>
        <p className="mt-4 text-gray-500">Loading favourites...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h1 className="text-xl font-semibold text-gray-900">Favourites</h1>
      <p className="mt-1 text-sm text-gray-600">Properties you have saved will appear here.</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {listings.length === 0 && !error ? (
        <p className="mt-4 text-sm text-gray-500">No favourites yet.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {listings.map((item) => {
            const id = item.id
            const href = propertyDetailHref(item)
            const title = buildTitle(item)
            const monthlyRent = typeof item.monthlyRent === 'number' ? item.monthlyRent : 0
            const price =
              monthlyRent > 0
                ? `₹${Number(item.monthlyRent).toLocaleString('en-IN')} per month`
                : 'Price on request'
            const imageUrl = item.imageUrl ?? item.thumbnailUrl ?? ''
            const status = item.status?.trim() || 'Available'

            return (
              <article
                key={id ?? title}
                className="flex flex-col sm:flex-row border border-gray-200 rounded-xl overflow-hidden"
              >
                <Link
                  href={href}
                  className="relative flex-shrink-0 w-full sm:w-56 aspect-[4/3] sm:aspect-auto sm:h-[140px] bg-gray-100"
                >
                  {imageUrl && imageUrl.trim() ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded bg-green-600 text-white text-xs font-medium px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    {status}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center p-4 gap-4">
                  <div className="min-w-0 flex-1">
                    <Link href={href} className="font-semibold text-primary-600 hover:underline line-clamp-2">
                      {title}
                    </Link>
                    <p className="mt-1 text-gray-900 font-medium">{price}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={href}
                      className="inline-flex items-center justify-center rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 text-sm"
                    >
                      View Listing
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-lg bg-accent-green hover:bg-accent-green-hover text-white font-medium px-4 py-2 text-sm"
                    >
                      Message Landlord
                    </Link>
                    <button
                      type="button"
                      onClick={() => id != null && handleRemove(id)}
                      disabled={removingId === id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 text-sm disabled:opacity-60"
                    >
                      {removingId === id ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            )
          })}

          <div className="pt-4 border-t border-gray-200">
            <a
              href="mailto:?subject=Favourites list&body=See my saved properties"
              className="inline-flex items-center gap-2 text-primary-600 font-medium hover:underline"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email this list of favourites
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
