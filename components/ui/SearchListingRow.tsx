'use client'

import Link from 'next/link'

export interface SearchListingRowProps {
  href?: string
  /** Image URL; when empty or not provided, "No image provided" is shown */
  image?: string
  /** Landlord profile image (small avatar overlay) */
  landlordImage?: string
  title: string
  location?: string
  price: string
  pricePeriod?: string
  description?: string
  beds?: number
  baths?: number
  furnishing?: string
  /** e.g. ["Garden", "Parking"] from API features */
  featureTags?: string[]
  /** e.g. "DRAFT" - shown as badge when present */
  status?: string
  lastUpdated?: string
  distance?: string
}

export default function SearchListingRow({
  href = '/search',
  image,
  landlordImage,
  title,
  location,
  price,
  pricePeriod = '/ month',
  description,
  beds,
  baths,
  furnishing,
  featureTags,
  status,
  lastUpdated,
  distance,
}: SearchListingRowProps) {
  const features: string[] = []
  if (beds != null) features.push(beds === 1 ? '1 Bed' : `${beds} Beds`)
  if (baths != null) features.push(baths === 1 ? '1 Bath' : `${baths} Baths`)
  if (furnishing) features.push(furnishing)
  if (featureTags?.length) features.push(...featureTags)

  return (
    <article className="group flex flex-col sm:flex-row bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-primary-200 hover:shadow-lg transition-all duration-300">
      <Link href={href} className="relative flex-shrink-0 w-full sm:w-72 aspect-square sm:aspect-[4/3] bg-gray-100 flex items-center justify-center">
        {status && (
          <span className="absolute top-3 left-3 rounded-lg bg-gray-700/90 text-white text-xs font-semibold px-2 py-1 uppercase tracking-wide z-10">
            {status}
          </span>
        )}
        {image && image.trim() ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <span className="text-gray-400 text-sm font-medium text-center px-4">No image provided</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline gap-2 mb-1">
          <span className="text-xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-500 text-sm">{pricePeriod}</span>
          {distance && (
            <span className="text-gray-400 text-sm ml-auto">· {distance}</span>
          )}
        </div>
        {lastUpdated && (
          <p className="text-gray-400 text-sm mb-2">{lastUpdated}</p>
        )}
        <Link href={href}>
          <h2 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {title}
            {location && (
              <span className="font-normal text-gray-600">, {location}</span>
            )}
          </h2>
        </Link>
        {description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
            {description}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {features.length > 0 && (
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              {features.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
          )}
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-xl bg-accent-green hover:bg-accent-green-hover text-white font-semibold px-5 py-2.5 text-sm transition-colors shrink-0"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  )
}
