'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useApiClient } from '@/lib/api/useApiClient'
import { useKeycloak } from '@/lib/auth/keycloak'

const FURNISHING_LABELS: Record<string, string> = {
  FURNISHED: 'Furnished',
  SEMI_FURNISHED: 'Semi-Furnished',
  UNFURNISHED: 'Unfurnished',
}

// Temporary mock property images (served from /public/assets/properties/*)
const MOCK_PROPERTY_IMAGES: string[] = [
  '/assets/properties/property-1.jpeg',
  '/assets/properties/property-2.jpeg',
  '/assets/properties/property-3.jpeg',
  '/assets/properties/property-4.jpeg',
  '/assets/properties/property-5.jpeg',
]

interface ViewListingItem {
  id?: number
  houseNumber?: string | null
  addressLine2?: string | null
  addressLine3?: string | null
  town?: string | null
  postcode?: string | null
  description?: string | null
  monthlyRent?: number | null
  deposit?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  furnishing?: string | null
  propertyType?: string | null
  status?: string | null
  imageUrl?: string | null
  thumbnailUrl?: string | null
  billsIncluded?: boolean | null
  earliestMoveIn?: string | null
  minimumTenancyMonths?: number | null
  acceptStudents?: boolean | null
  acceptFamilies?: boolean | null
  petsAllowed?: boolean | null
  smokersAllowed?: boolean | null
  dssAllowed?: boolean | null
  epcRating?: string | null
  maxTenants?: number | null
  features?: {
    garden?: boolean
    parking?: boolean
    fireplace?: boolean
    liveInLandlord?: boolean
  } | null
  /** Optional: multiple image URLs for gallery (if API provides; else we use imageUrl + thumbnailUrl) */
  images?: string[] | null
  /**
   * Landlord – for "Meet the Landlord" section. Backend keys (same names in API response):
   * - name: string (e.g. "Nazneen Z.")
   * - landlordAvatarUrl: string (profile image URL)
   * - landlordResponseRate: number (e.g. 99 for 99%)
   * - landlordResponseTime: string (e.g. "Within 3 Days")
   * - landlordMemberSince: string (e.g. "May 2024")
   * - landlordEmailVerified: boolean
   * - landlordPhoneVerified: boolean
   */
  name?: string | null
  landlordAvatarUrl?: string | null
  landlordResponseRate?: number | null
  landlordResponseTime?: string | null
  landlordMemberSince?: string | null
  landlordEmailVerified?: boolean | null
  landlordPhoneVerified?: boolean | null
  landlordId?: number | string | null
  [key: string]: unknown
}

interface ViewListingApiResponse {
  responseMessage?: {
    responseData?: { properties?: ViewListingItem[] }
  }
}

function buildAddress(item: ViewListingItem): string {
  const parts = [
    item.houseNumber,
    item.addressLine2,
    item.addressLine3,
    item.town,
    item.postcode,
  ].filter((p) => typeof p === 'string' && p.trim())
  return parts.join(', ')
}

function buildTitle(item: ViewListingItem): string {
  const house = item.houseNumber?.trim() || ''
  const town = item.town?.trim() || ''
  const postcode = item.postcode?.trim() || ''
  const type = item.propertyType?.trim() || 'Property'
  const main = [house, town || postcode].filter(Boolean).join(', ') || type
  return main ? `${type}, ${main}` : type
}

/** Table row with optional Yes/No indicator (check or X) for booleans */
function InfoRow({
  label,
  value,
  yesNo,
}: {
  label: string
  value: React.ReactNode
  yesNo?: boolean | null
}) {
  const showYesNo = yesNo !== undefined && yesNo !== null
  const display =
    showYesNo ? (
      yesNo ? (
        <span className="text-green-600 font-medium">✓ Yes</span>
      ) : (
        <span className="text-red-600 font-medium">✗ No</span>
      )
    ) : (
      value
    )
  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="px-5 py-3 text-gray-600 w-40 align-top">{label}</td>
      <td className="px-5 py-3 text-gray-900">{display ?? '—'}</td>
    </tr>
  )
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const api = useApiClient()
  const { token } = useKeycloak()
  const id = params?.id != null ? String(params.id) : null
  const [listing, setListing] = useState<ViewListingItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [isFavourite, setIsFavourite] = useState(false)
  const [favouriteLoading, setFavouriteLoading] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('Invalid property')
      return
    }
    const fetchListing = async () => {
      setLoading(true)
      setError(null)
      const numId = parseInt(id, 10)
      if (Number.isNaN(numId)) {
        setError('Invalid property')
        setLoading(false)
        return
      }
      try {
        const data = await api.post<ViewListingApiResponse>(
          '/api/listing/view',
          { id: numId },
          { baseURL: '' }
        )
        const list = data?.responseMessage?.responseData?.properties
        if (Array.isArray(list) && list.length > 0) {
          setListing(list[0])
        } else {
          setListing(null)
          setError('Property not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property')
        setListing(null)
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
  }, [id, api])

  // Check if this listing is favourited only when user is logged in (else backend returns 401 and would redirect to login)
  useEffect(() => {
    if (!token || !listing?.id || typeof listing.id !== 'number') return
    const checkFavourite = async () => {
      try {
        const data = await api.post<{
          isFavourite?: boolean
          responseMessage?: { responseData?: boolean | { isFavourite?: boolean } }
        }>('/api/listing/isFavourite', { id: listing.id }, { baseURL: '' })
        const res = data?.responseMessage?.responseData
        const fav =
          (data as { isFavourite?: boolean })?.isFavourite ??
          (res === true || (typeof res === 'object' && res !== null && (res as { isFavourite?: boolean }).isFavourite)) ??
          false
        setIsFavourite(!!fav)
      } catch {
        setIsFavourite(false)
      }
    }
    checkFavourite()
  }, [token, listing?.id, api])

  const toggleFavourite = async () => {
    if (!listing?.id || typeof listing.id !== 'number' || favouriteLoading) return
    // Adding/removing favourites requires login
    if (!token) {
      const redirect = encodeURIComponent(
        typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/search'
      )
      window.location.href = `/auth/login?redirect=${redirect}`
      return
    }
    setFavouriteLoading(true)
    try {
      if (isFavourite) {
        await api.post('/api/listing/removeFavourite', { id: listing.id }, { baseURL: '' })
        setIsFavourite(false)
      } else {
        await api.post('/api/listing/addfavourite', { id: listing.id }, { baseURL: '' })
        setIsFavourite(true)
      }
    } catch {
      // Keep current state on error
    } finally {
      setFavouriteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary-500/30 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading property</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-gray-600 text-lg">{error ?? 'Property not found'}</p>
        <Link href="/search" className="text-primary-600 font-semibold hover:underline">
          ← Back to search
        </Link>
      </div>
    )
  }

  const monthlyRent = typeof listing.monthlyRent === 'number' ? listing.monthlyRent : 0
  const pricePcm =
    monthlyRent > 0 ? `₹${Number(monthlyRent).toLocaleString('en-IN')}` : 'Price on request'
  const pricePw =
    monthlyRent > 0 ? `₹${Math.round(monthlyRent / 4.33).toLocaleString('en-IN')} pw` : null
  const depositAmount =
    typeof listing.deposit === 'number' && listing.deposit > 0
      ? listing.deposit
      : monthlyRent > 0
        ? Math.round(monthlyRent / 1.15)
        : null
  const depositDisplay =
    depositAmount != null ? `₹${Number(depositAmount).toLocaleString('en-IN')}` : '—'
  const address = buildAddress(listing)
  const title = buildTitle(listing)
  const locationLabel = [listing.town, listing.postcode].filter(Boolean).join(', ') || address || '—'

  // For now, use static mock images for the property gallery (later we can wire real media URLs)
  const images = MOCK_PROPERTY_IMAGES
  const hasMultipleImages = images.length > 1
  const displayImage = images[selectedImageIndex] ?? images[0]

  const goPrevImage = () => setSelectedImageIndex((i) => (i <= 0 ? images.length - 1 : i - 1))
  const goNextImage = () => setSelectedImageIndex((i) => (i >= images.length - 1 ? 0 : i + 1))

  const beds = listing.bedrooms
  const baths = listing.bathrooms
  const furnishing = listing.furnishing
    ? FURNISHING_LABELS[listing.furnishing] || listing.furnishing
    : null
  const availableFrom = listing.earliestMoveIn?.trim() || '—'
  const minTenancy =
    typeof listing.minimumTenancyMonths === 'number' && listing.minimumTenancyMonths > 0
      ? `${listing.minimumTenancyMonths} month${listing.minimumTenancyMonths === 1 ? '' : 's'}`
      : '—'
  const epcRating = listing.epcRating?.trim() || null

  const DESC_PREVIEW_LEN = 300
  const description = listing.description ?? ''
  const showReadMore = description.length > DESC_PREVIEW_LEN
  const descriptionText = descriptionExpanded || !showReadMore
    ? description
    : description.slice(0, DESC_PREVIEW_LEN) + '...'

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/search"
            className="text-gray-600 hover:text-primary-600 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to search
          </Link>
        </div>
      </div>

      {/* Two-column: image + main content (left) | sidebar (right) - OpenRent: image only in left column, not full width */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Left column: image gallery + content (image constrained to this column) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery - same width as left column only */}
            <div className="bg-gray-200 rounded-lg overflow-hidden">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    No image provided
                  </div>
                )}
                {listing.status && (
                  <span className="absolute top-4 left-4 bg-white/95 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded uppercase">
                    {listing.status}
                  </span>
                )}
                {/* Left/Right arrow buttons when multiple photos - OpenRent style */}
                {hasMultipleImages && images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-gray-800 z-10"
                      aria-label="Previous image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={goNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-gray-800 z-10"
                      aria-label="Next image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                {/* Map & Favourite buttons - OpenRent style */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-white transition-colors"
                    aria-label="View map"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Map
                  </button>
                  <button
                    type="button"
                    onClick={toggleFavourite}
                    disabled={favouriteLoading}
                    title={!token ? 'Sign in to add to favourites' : isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition-colors ${
                      isFavourite
                        ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        : 'bg-white/95 text-gray-800 hover:bg-white'
                    }`}
                    aria-label={!token ? 'Sign in to add to favourites' : isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    {favouriteLoading ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill={isFavourite ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    )}
                    Favourite
                  </button>
                </div>
                {hasMultipleImages && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedImageIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          selectedImageIndex === i ? 'w-5 bg-white' : 'w-1.5 bg-white/70'
                        }`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {hasMultipleImages && images.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto bg-gray-900/80">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      className={`relative flex-shrink-0 w-20 h-14 rounded overflow-hidden border-2 ${
                        selectedImageIndex === i ? 'border-white' : 'border-transparent opacity-80'
                      }`}
                    >
                      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Icon row directly below photo - OpenRent style: bedrooms, bathrooms, tenant max, location */}
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 text-sm list-none mt-4 mb-1">
              {beds != null && (
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{beds} {beds === 1 ? 'bedroom' : 'bedrooms'}</span>
                </li>
              )}
              {baths != null && (
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>{baths} {baths === 1 ? 'bathroom' : 'bathrooms'}</span>
                </li>
              )}
              {typeof listing.maxTenants === 'number' && listing.maxTenants > 0 && (
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{listing.maxTenants} tenant{listing.maxTenants === 1 ? '' : 's'} max.</span>
                </li>
              )}
              {locationLabel && (
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{locationLabel}</span>
                </li>
              )}
            </ul>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{title}</h1>

            {/* Description with Read more */}
            {description && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <p className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-line">
                  {descriptionText}
                </p>
                {showReadMore && (
                  <button
                    type="button"
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="mt-2 text-primary-600 font-medium text-sm hover:underline"
                  >
                    {descriptionExpanded ? 'Read less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Four sections: Prices & Bills | Tenant Preference, Availability | Features (OpenRent style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prices & Bills */}
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <h2 className="text-base font-semibold text-gray-900 px-5 py-4 border-b border-gray-200">
                  Prices & Bills
                </h2>
                <table className="w-full text-sm">
                  <tbody>
                    <InfoRow label="Deposit" value={depositDisplay} />
                    <InfoRow label="Rent PCM" value={pricePcm} />
                    {pricePw && (
                      <InfoRow label="Rent per week" value={pricePw} />
                    )}
                    <InfoRow
                      label="Bills Included"
                      value={null}
                      yesNo={listing.billsIncluded ?? false}
                    />
                    {/* <tr className="border-b border-gray-100 last:border-b-0">
                      <td className="px-5 py-3 text-gray-600 w-40 align-top">Broadband</td>
                      <td className="px-5 py-3 text-gray-900">
                        <a
                          href="#broadband"
                          className="text-primary-600 hover:underline font-medium"
                        >
                          View offers
                        </a>
                      </td>
                    </tr> */}
                  </tbody>
                </table>
              </section>

              {/* Tenant Preference */}
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <h2 className="text-base font-semibold text-gray-900 px-5 py-4 border-b border-gray-200">
                  Tenant Preference
                </h2>
                <table className="w-full text-sm">
                  <tbody>
                    <InfoRow
                      label="Student Friendly"
                      value={null}
                      yesNo={listing.acceptStudents ?? false}
                    />
                    <InfoRow
                      label="Families Allowed"
                      value={null}
                      yesNo={listing.acceptFamilies ?? false}
                    />
                    <InfoRow
                      label="Pets Allowed"
                      value={null}
                      yesNo={listing.petsAllowed ?? false}
                    />
                    <InfoRow
                      label="Smokers Allowed"
                      value={null}
                      yesNo={listing.smokersAllowed ?? false}
                    />
                    <tr className="border-b border-gray-100 last:border-b-0">
                      <td className="px-5 py-3 text-gray-600 w-40 align-top">
                        DSS/LHA Covers Rent
                        <span className="ml-1 text-gray-400 cursor-help" title="Department of Social Security / Local Housing Allowance">
                          ⓘ
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {listing.dssAllowed === true ? (
                          <span className="text-green-600 font-medium">✓ Yes</span>
                        ) : (
                          <span className="text-red-600 font-medium">✗ No</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              {/* Availability */}
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <h2 className="text-base font-semibold text-gray-900 px-5 py-4 border-b border-gray-200">
                  Availability
                </h2>
                <table className="w-full text-sm">
                  <tbody>
                    <InfoRow label="Available From" value={availableFrom} />
                    <InfoRow label="Minimum Tenancy" value={minTenancy} />
                  </tbody>
                </table>
              </section>

              {/* Features */}
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <h2 className="text-base font-semibold text-gray-900 px-5 py-4 border-b border-gray-200">
                  Features
                </h2>
                <table className="w-full text-sm">
                  <tbody>
                    <InfoRow
                      label="Garden"
                      value={null}
                      yesNo={listing.features?.garden ?? false}
                    />
                    <InfoRow
                      label="Parking"
                      value={null}
                      yesNo={listing.features?.parking ?? false}
                    />
                    <InfoRow
                      label="Fireplace"
                      value={null}
                      yesNo={listing.features?.fireplace ?? false}
                    />
                    {furnishing && (
                      <InfoRow label="Furnishing" value={furnishing} />
                    )}
                    {epcRating && (
                      <InfoRow label="EPC Rating" value={epcRating} />
                    )}
                  </tbody>
                </table>
              </section>
            </div>
          </div>

          {/* Sidebar - 1 column width (OpenRent style) */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <span className="inline-block bg-green-600 text-white text-xs font-semibold px-2.5 py-1 rounded mb-3">
                  Available
                </span>
                <p className="text-2xl font-bold text-gray-900">{pricePcm}</p>
                <p className="text-gray-500 text-sm mt-0.5">per month</p>
                {pricePw && (
                  <p className="text-gray-600 text-sm mt-1">{pricePw}</p>
                )}
              </div>
              <div className="p-5 space-y-3">
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  No admin fees
                  <span className="text-green-600">✓</span>
                </p>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  No hidden charges
                  <span className="text-green-600">✓</span>
                </p>
                <p className="text-gray-700 text-sm font-medium pt-1">Ready to Rent Now?</p>
                <span
                  title="Coming soon"
                  className="block w-full text-center bg-green-600/90 text-white font-semibold py-3 px-4 rounded-lg text-sm cursor-not-allowed"
                >
                  Rent Now
                </span>
                <p className="text-gray-600 text-sm font-medium pt-2">Next Steps</p>
                {listing.id != null ? (
                  <Link
                    href={`/message-landlord/${listing.id}`}
                    className="block w-full text-center bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg text-sm hover:bg-primary-700 transition-colors"
                  >
                    Message Landlord or Request Viewing
                  </Link>
                ) : (
                  <span className="block w-full text-center bg-gray-300 text-gray-500 font-semibold py-3 px-4 rounded-lg text-sm cursor-not-allowed">
                    Message Landlord or Request Viewing
                  </span>
                )}
                <span
                  title="Coming soon"
                  className="block w-full text-center border-2 border-gray-300 text-gray-500 font-semibold py-2.5 px-4 rounded-lg text-sm cursor-not-allowed"
                >
                  Enquire about this property
                </span>
              </div>

              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                <p className="text-gray-500 text-xs">
                  Property reference: <span className="font-medium text-gray-700">{listing.id ?? id}</span>
                </p>
                <Link
                  href={listing.id != null ? `/report/${listing.id}` : '#'}
                  className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  <svg className="w-4 h-4 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Report listing
                </Link>
              </div>

              {/* Meet the Landlord - OpenRent style */}
              <div className="p-5 border-t border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Meet the Landlord</h3>
                <div className="flex gap-4">
                  <div className="shrink-0">
                    {listing.landlordAvatarUrl && listing.landlordAvatarUrl.trim() ? (
                      <img
                        src={listing.landlordAvatarUrl}
                        alt={listing.name || 'Landlord'}
                        className="w-14 h-14 rounded-full object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-lg font-semibold">
                        {(listing.name || 'L').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {listing.name?.trim() || 'Landlord'}
                    </p>
                    {listing.landlordResponseRate != null && (
                      <p className="text-sm text-gray-600 mt-1">
                        Response Rate:{' '}
                        <span className="font-medium text-gray-900">{listing.landlordResponseRate}%</span>
                        <span className="ml-1 text-gray-400 cursor-help" title="The percentage of enquiries this landlord has replied to">ⓘ</span>
                      </p>
                    )}
                    {listing.landlordResponseTime && (
                      <p className="text-sm text-gray-600 mt-0.5">
                        Response Time:{' '}
                        <span className="font-medium text-gray-900">{listing.landlordResponseTime}</span>
                        <span className="ml-1 text-gray-400 cursor-help" title="Average time to reply to first enquiry">ⓘ</span>
                      </p>
                    )}
                    {listing.landlordMemberSince && (
                      <p className="text-sm text-gray-500 mt-1">Member since {listing.landlordMemberSince}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {listing.landlordEmailVerified && (
                        <span className="text-xs text-green-600 font-medium">Email verified</span>
                      )}
                      {listing.landlordPhoneVerified && (
                        <span className="text-xs text-green-600 font-medium">Phone verified</span>
                      )}
                    </div>
                    <span className="inline-block mt-2 text-sm text-gray-400 cursor-not-allowed" title="Coming soon">
                      View landlord&apos;s other properties
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
