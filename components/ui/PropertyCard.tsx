import Link from 'next/link'

export type PropertyCardTag = 'Verified' | 'No Brokerage' | 'Price Drop' | 'Recently Added'

export interface PropertyCardProps {
  href?: string
  image: string
  title: string
  location: string
  price: string
  pricePeriod?: string
  beds?: number
  baths?: number
  tags?: PropertyCardTag[]
  /** Compact variant: smaller card, denser layout */
  variant?: 'default' | 'compact' | 'premium'
  /** Theme variant for different contexts (e.g., 'marketplace') */
  theme?: string
  className?: string
}

const tagStyles: Record<PropertyCardTag, string> = {
  Verified: 'bg-emerald-600 text-white',
  'No Brokerage': 'bg-primary-600 text-white',
  'Price Drop': 'bg-amber-500 text-white',
  'Recently Added': 'bg-sky-600 text-white',
}

export default function PropertyCard({
  href = '/search',
  image,
  title,
  location,
  price,
  pricePeriod = '/ month',
  beds,
  baths,
  tags = [],
  variant = 'default',
  theme,
  className = '',
}: PropertyCardProps) {
  const isCompact = variant === 'compact'
  const isPremium = variant === 'premium'
  const tagStyleMap = (tag: PropertyCardTag) => tagStyles[tag]
  const hoverText = 'group-hover:text-primary-600'
  const borderHover = 'hover:border-primary-200'
  const premiumHover = isPremium ? 'border-neutral-200 hover:border-neutral-300 hover:shadow-xl' : ''

  const content = (
    <>
      <div
        className={`relative overflow-hidden ${isPremium ? 'rounded-t-2xl aspect-[4/5]' : 'rounded-t-xl'} ${!isPremium ? (isCompact ? 'aspect-[4/3]' : 'aspect-[4/3]') : ''}`}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          width={isCompact ? 280 : isPremium ? 520 : 400}
          height={isCompact ? 210 : isPremium ? 650 : 300}
        />
        {tags.length > 0 && !isPremium && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${tagStyleMap(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {isPremium ? (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-10 sm:pt-12 md:pt-16 pb-3 sm:pb-4 px-3 sm:px-4">
            <span className="text-white font-semibold text-base sm:text-lg md:text-xl tracking-tight block line-clamp-2">{title}</span>
            <span className="text-white/90 text-xs sm:text-sm">{location}</span>
            <span className="text-white font-bold text-lg sm:text-xl md:text-2xl mt-0.5 sm:mt-1 block">
              {price}
              <span className="font-normal text-sm opacity-90">{pricePeriod}</span>
            </span>
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-2 px-2">
            <span className="text-white font-bold text-sm md:text-base drop-shadow-sm">
              {price}
              <span className="font-normal text-xs opacity-90">{pricePeriod}</span>
            </span>
          </div>
        )}
      </div>
      {!isPremium && (
        <div className={isCompact ? 'p-3' : 'p-4'}>
          <h3 className={`font-semibold text-gray-900 transition-colors ${hoverText} ${isCompact ? 'text-sm line-clamp-1' : ''}`}>
            {title}, {location}
          </h3>
          {(beds != null || baths != null) && (
            <p className={`text-gray-500 ${isCompact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>
              {beds != null && `${beds} BHK`}
              {beds != null && baths != null && ' · '}
              {baths != null && `${baths} bath`}
            </p>
          )}
        </div>
      )}
    </>
  )

  const wrapperClass = `group block bg-white overflow-hidden transition-all duration-300 ${isPremium ? 'rounded-2xl shadow-sm ' + premiumHover : 'rounded-xl border border-gray-200 shadow-sm hover:shadow-lg ' + borderHover} ${className}`

  return (
    <Link href={href} className={wrapperClass}>
      {content}
    </Link>
  )
}
