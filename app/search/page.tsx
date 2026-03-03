'use client'

import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useApiClient } from '@/lib/api/useApiClient'
import SearchListingRow from '@/components/ui/SearchListingRow'
import { EmailAlertsModal } from '@/components/ui/EmailAlertsModal'

const PAGE_SIZE = 25

const FURNISHING_LABELS: Record<string, string> = {
  FURNISHED: 'Furnished',
  SEMI_FURNISHED: 'Semi-Furnished',
  UNFURNISHED: 'Unfurnished',
}

/** Backend filter-options field names */
const FILTER_OPTION_FIELDS = ['property_type', 'furnishing', 'BEDROOMS', 'BATHROOMS', 'TOWN', 'EPC_RATING'] as const

/** Generic fetch for filter options: GET /api/listing/filter-options?field=X */
async function fetchFilterOptions(field: string): Promise<string[]> {
  const res = await fetch(`/api/listing/filter-options?field=${encodeURIComponent(field)}`)
  if (!res.ok) return []
  const data = (await res.json()) as { responseMessage?: { responseData?: string[] } }
  const arr = data?.responseMessage?.responseData
  return Array.isArray(arr) ? arr : []
}

/** Single listing item from POST /api/listing/v1.0/view response */
export interface ViewListingItem {
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
  properties?: string | null
  features?: {
    garden?: boolean
    parking?: boolean
    fireplace?: boolean
    liveInLandlord?: boolean
  } | null
  [key: string]: unknown
}

/** API view listing response (responseMessage.responseData.properties + totalCount) */
interface ViewListingApiResponse {
  responseMessage?: {
    responseData?: { properties?: ViewListingItem[]; totalCount?: number }
    message?: string
    httpStatus?: number
  }
}

export interface MappedListing {
  id: unknown
  image: string
  title: string
  location: string
  price: string
  pricePeriod: string
  description?: string
  beds?: number
  baths?: number
  furnishing?: string
  featureTags?: string[]
  status?: string
  href: string
}

/** Slug for URL: lowercase, hyphens, no special chars (OpenRent-style). */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'property'
}

/** Build OpenRent-style URL: /property-to-rent/{location}/{slug}/{id} */
function propertyDetailHref(item: ViewListingItem): string {
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

function mapListing(item: ViewListingItem, index: number): MappedListing {
  const num = typeof item.monthlyRent === 'number' ? item.monthlyRent : 0
  const price = num > 0 ? `₹${Number(num).toLocaleString('en-IN')}` : 'Price on request'

  const houseNumber = item.houseNumber?.trim() || ''
  const town = item.town?.trim() || ''
  const postcode = item.postcode?.trim() || ''
  const addressLine2 = item.addressLine2?.trim() || ''
  const addressLine3 = item.addressLine3?.trim() || ''

  const title = [houseNumber, town || postcode].filter(Boolean).join(', ') || 'Property'
  const addressParts = [houseNumber, addressLine2, addressLine3].filter(Boolean)
  const location = [...addressParts, town, postcode].filter(Boolean).join(' · ') || '—'

  const beds = typeof item.bedrooms === 'number' ? item.bedrooms : undefined
  const baths = typeof item.bathrooms === 'number' ? item.bathrooms : undefined
  const furnishingRaw = item.furnishing
  const furnishing = furnishingRaw ? FURNISHING_LABELS[furnishingRaw] || furnishingRaw : undefined
  const description = typeof item.description === 'string' ? item.description : undefined

  const featureTags: string[] = []
  if (item.features?.garden) featureTags.push('Garden')
  if (item.features?.parking) featureTags.push('Parking')
  if (item.features?.fireplace) featureTags.push('Fireplace')
  if (item.features?.liveInLandlord) featureTags.push('Live-in landlord')

  const id = item.id
  const href = propertyDetailHref(item)
  const status = item.status ?? undefined

  const imageUrl = item.imageUrl ?? item.thumbnailUrl
  const image = typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : ''

  return {
    id,
    image,
    title,
    location,
    price,
    pricePeriod: '/ month',
    description: description ? description.slice(0, 180) + (description.length > 180 ? '...' : '') : undefined,
    beds,
    baths,
    furnishing,
    featureTags: featureTags.length > 0 ? featureTags : undefined,
    status,
    href,
  }
}

function parsePriceFilter(priceFilter: string): { minRent?: number; maxRent?: number } {
  if (!priceFilter || priceFilter === 'any') return {}
  const [a, b] = priceFilter.split('-').map(Number)
  const minRent = Number.isNaN(a) ? undefined : a
  const maxRent = b === 0 || Number.isNaN(b) ? undefined : b
  return { minRent: minRent || undefined, maxRent: maxRent || undefined }
}

function SearchResultsInner() {
  const searchParams = useSearchParams()
  const api = useApiClient()
  const locationQuery = searchParams.get('q') ?? ''
  const [locationInput, setLocationInput] = useState(locationQuery)
  const [radius, setRadius] = useState(10)
  const [priceFilter, setPriceFilter] = useState<string>('any')
  const [bedsFilter, setBedsFilter] = useState<string>('any')
  const [listings, setListings] = useState<ViewListingItem[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alertsModalOpen, setAlertsModalOpen] = useState(false)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('any')
  const [furnishingFilter, setFurnishingFilter] = useState<string>('any')
  const [bathroomsFilter, setBathroomsFilter] = useState<string>('any')
  const [townFilter, setTownFilter] = useState<string>('any')
  const [epcFilter, setEpcFilter] = useState<string>('any')
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({})
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocationInput(locationQuery)
  }, [locationQuery])

  // Generic load filter options for a field (bind DDLs)
  const loadOptionsForField = useCallback(async (field: string) => {
    const options = await fetchFilterOptions(field)
    setFilterOptions((prev) => ({ ...prev, [field]: options }))
  }, [])

  useEffect(() => {
    if (!moreFiltersOpen) return
    FILTER_OPTION_FIELDS.forEach((f) => {
      if (filterOptions[f] === undefined) loadOptionsForField(f)
    })
  }, [moreFiltersOpen, filterOptions, loadOptionsForField])

  const fetchPage = useCallback(
    async (startRow: number, endRow: number, append: boolean) => {
      try {
        const { minRent, maxRent } = parsePriceFilter(priceFilter)
        const minBedrooms = bedsFilter && bedsFilter !== 'any' ? parseInt(bedsFilter, 10) : undefined
        const body: Record<string, unknown> = {
          startRow,
          endRow,
          ...(minRent != null && minRent > 0 && { minRent }),
          ...(maxRent != null && maxRent > 0 && { maxRent }),
          ...(minBedrooms != null && !Number.isNaN(minBedrooms) && minBedrooms > 0 && { minBedrooms }),
          ...(propertyTypeFilter && propertyTypeFilter !== 'any' && { propertyType: propertyTypeFilter }),
          ...(furnishingFilter && furnishingFilter !== 'any' && { furnishing: furnishingFilter }),
          ...(bathroomsFilter && bathroomsFilter !== 'any' && !Number.isNaN(parseInt(bathroomsFilter, 10)) && { minBathrooms: parseInt(bathroomsFilter, 10) }),
          ...(townFilter && townFilter !== 'any' && { town: townFilter }),
          ...(epcFilter && epcFilter !== 'any' && { epcRating: epcFilter }),
        }
        const data = await api.post<ViewListingApiResponse>(
          '/api/listing/view',
          body,
          { baseURL: '' }
        )
        const raw = data?.responseMessage?.responseData?.properties
        const count = data?.responseMessage?.responseData?.totalCount ?? 0
        if (append) {
          setListings((prev) => (Array.isArray(raw) ? [...prev, ...(raw as ViewListingItem[])] : prev))
        } else {
          setListings(Array.isArray(raw) ? (raw as ViewListingItem[]) : [])
        }
        setTotalCount(count)
        return { properties: raw, totalCount: count }
      } catch (err) {
        if (!append) setError(err instanceof Error ? err.message : 'Failed to load listings')
        return { properties: [], totalCount: 0 }
      }
    },
    [api, priceFilter, bedsFilter, propertyTypeFilter, furnishingFilter, bathroomsFilter, townFilter, epcFilter]
  )

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      setLoadingMore(false)
      await fetchPage(1, PAGE_SIZE, false)
      if (!cancelled) setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [fetchPage])

  const loadMore = useCallback(async () => {
    if (loadingMore || loading) return
    if (listings.length >= totalCount) return
    setLoadingMore(true)
    const nextStart = listings.length + 1
    const nextEnd = Math.min(listings.length + PAGE_SIZE, totalCount)
    await fetchPage(nextStart, nextEnd, true)
    setLoadingMore(false)
  }, [fetchPage, listings.length, loadingMore, loading, totalCount])

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && listings.length < totalCount && !loadingMore && !loading) {
          loadMore()
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [listings.length, totalCount, loadingMore, loading, loadMore])

  const mapped = useMemo(
    () => listings.map((item, i) => mapListing(item, i)),
    [listings]
  )

  const filtered = useMemo(() => {
    let result = mapped
    const loc = locationInput.trim().toLowerCase()
    if (loc) {
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(loc) ||
          l.location.toLowerCase().includes(loc)
      )
    }
    return result
  }, [mapped, locationInput])

  const pageTitle = locationInput.trim()
    ? `Properties to rent in ${locationInput.trim()}`
    : 'Properties to rent'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {pageTitle}
          </h1>

          {/* Search & filters row */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            <div className="flex flex-wrap items-end gap-3 flex-1">
              <div className="min-w-[200px] flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="e.g. Bangalore, Koramangala"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-9 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {locationInput && (
                    <button
                      type="button"
                      onClick={() => setLocationInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Clear"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Radius</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value, 10) || 10)}
                    className="w-20 rounded-xl border border-gray-300 px-3 py-2.5 text-center focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <select
                  className="rounded-xl border border-gray-300 px-3 py-2.5 bg-white focus:ring-2 focus:ring-primary-500"
                  aria-label="Radius unit"
                >
                  <option value="km">km</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  setError(null)
                  fetchPage(1, PAGE_SIZE, false).finally(() => setLoading(false))
                }}
                className="rounded-xl bg-accent-green hover:bg-accent-green-hover text-white font-semibold px-5 py-2.5 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2.5 bg-white min-w-[120px] focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="any">Any price</option>
                    <option value="0-15000">Under ₹15,000</option>
                    <option value="15000-30000">₹15,000 - ₹30,000</option>
                    <option value="30000-50000">₹30,000 - ₹50,000</option>
                    <option value="50000-0">₹50,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beds</label>
                  <select
                    value={bedsFilter}
                    onChange={(e) => setBedsFilter(e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2.5 bg-white min-w-[140px] focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="any">Any</option>
                    <option value="1">Studio / 1 bed</option>
                    <option value="2">2+ beds</option>
                    <option value="3">3+ beds</option>
                    <option value="4">4+ beds</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setMoreFiltersOpen((o) => !o)}
                  className={`rounded-xl border-2 px-4 py-2.5 flex items-center gap-2 font-semibold transition-colors ${
                    moreFiltersOpen
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  More filters
                </button>
              </div>
            </div>

            {/* More filters panel - OpenRent style, minimal & premium */}
            {moreFiltersOpen && (
              <div className="mt-4 p-5 rounded-xl border border-gray-200 bg-gray-50/80">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Filters</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Property type</label>
                    <select
                      value={propertyTypeFilter}
                      onChange={(e) => setPropertyTypeFilter(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="any">Any</option>
                      {(filterOptions['property_type'] ?? []).map((opt) => (
                        <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Furnishing</label>
                    <select
                      value={furnishingFilter}
                      onChange={(e) => setFurnishingFilter(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="any">Any</option>
                      {(filterOptions['furnishing'] ?? []).map((opt) => (
                        <option key={opt} value={opt}>{FURNISHING_LABELS[opt] || opt.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Bathrooms</label>
                    <select
                      value={bathroomsFilter}
                      onChange={(e) => setBathroomsFilter(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="any">Any</option>
                      {(filterOptions['BATHROOMS'] ?? []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Town</label>
                    <select
                      value={townFilter}
                      onChange={(e) => setTownFilter(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="any">Any</option>
                      {(filterOptions['TOWN'] ?? []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">EPC rating</label>
                    <select
                      value={epcFilter}
                      onChange={(e) => setEpcFilter(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="any">Any</option>
                      {(filterOptions['EPC_RATING'] ?? []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setLoading(true)
                        setError(null)
                        fetchPage(1, PAGE_SIZE, false).finally(() => setLoading(false))
                      }}
                      className="w-full rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 text-sm"
                    >
                      Apply filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Map - Coming soon (non-clickable, not in filter section) */}
            <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
              <span title="Coming soon" className="cursor-not-allowed inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Map — Coming soon
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Loading listings...</div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-800 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Results summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-gray-600">
                {totalCount > 0 ? (
                  <>
                    Showing{' '}
                    <span className="font-semibold text-gray-900">
                      {filtered.length} of {totalCount}
                    </span>{' '}
                    properties
                    {listings.length < totalCount && (
                      <span className="text-gray-500 text-sm ml-1">(scroll for more)</span>
                    )}
                  </>
                ) : (
                  <span className="font-semibold text-gray-900">No properties found</span>
                )}
              </p>
              <button
                type="button"
                onClick={() => setAlertsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-green hover:bg-accent-green-hover text-white font-semibold px-4 py-2.5 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Create email alert
              </button>
            </div>

            <EmailAlertsModal
              open={alertsModalOpen}
              onClose={() => setAlertsModalOpen(false)}
              searchState={{
                location: locationInput,
                radiusKm: radius,
                priceFilter,
                bedsFilter,
              }}
            />

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-600 bg-white rounded-2xl border border-gray-200">
                <p className="text-lg font-medium">No properties found.</p>
                <p className="text-sm mt-1">Try adjusting your location or filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((listing, i) => (
                  <SearchListingRow
                    key={listing.id != null ? String(listing.id) : `listing-${i}`}
                    href={listing.href}
                    image={listing.image}
                    title={listing.title}
                    location={listing.location}
                    price={listing.price}
                    pricePeriod={listing.pricePeriod}
                    description={listing.description}
                    beds={listing.beds}
                    baths={listing.baths}
                    furnishing={listing.furnishing}
                    featureTags={listing.featureTags}
                    status={listing.status}
                  />
                ))}
                {/* Sentinel for infinite scroll */}
                {listings.length < totalCount && (
                  <div ref={loadMoreRef} className="flex justify-center py-6">
                    {loadingMore ? (
                      <span className="text-gray-500 text-sm">Loading more...</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Scroll for more</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      }
    >
      <SearchResultsInner />
    </Suspense>
  )
}
