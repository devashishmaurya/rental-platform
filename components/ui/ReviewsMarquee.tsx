'use client'

export interface MarqueeReviewItem {
  name: string
  /** Quote text (use either content or text) */
  content?: string
  text?: string
  rating?: number
  role?: string
  location?: string
}

interface ReviewsMarqueeProps {
  items: MarqueeReviewItem[]
  /** Card style: 'home' (gray-50) or 'landlords' (white on gray) */
  variant?: 'home' | 'landlords'
  className?: string
}

export default function ReviewsMarquee({
  items,
  variant = 'home',
  className = '',
}: ReviewsMarqueeProps) {
  if (items.length === 0) return null

  const quote = (item: MarqueeReviewItem) => item.content ?? item.text ?? ''
  const cardBg = variant === 'landlords' ? 'bg-white shadow-md' : 'bg-gray-50 border border-gray-100'

  // Duplicate list for seamless loop (marquee scrolls 50% then repeats)
  const duplicated = [...items, ...items]

  return (
    <div className={`overflow-hidden ${className}`} aria-label="User reviews marquee">
      <div className="reviews-marquee-track flex gap-6 w-max animate-marquee">
        {duplicated.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className={`flex-shrink-0 w-[min(340px,85vw)] p-6 rounded-xl ${cardBg} hover:shadow-lg transition-shadow duration-300`}
          >
            <div className="flex items-center gap-1 mb-3">
              {item.rating != null && item.rating > 0 &&
                [...Array(Math.min(5, Math.max(1, item.rating)))].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
            </div>
            <p className="text-gray-700 mb-4 italic">&ldquo;{quote(item)}&rdquo;</p>
            <div>
              <p className="font-semibold text-gray-900">{item.name}</p>
              {(item.role ?? item.location) && (
                <p className="text-sm text-gray-500">{item.role ?? item.location}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
