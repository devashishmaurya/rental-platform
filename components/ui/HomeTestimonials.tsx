'use client'

import { useState, useEffect } from 'react'
import { useApiClient } from '@/lib/api/useApiClient'
import type { Testimonial } from '@/config/content'
import ReviewsMarquee, { type MarqueeReviewItem } from '@/components/ui/ReviewsMarquee'

interface UserReview {
  id: number
  propertyId: number
  userId: number
  reviewerName: string
  rating: number
  reviewText: string
  isActive: boolean
  createdAt: string
}

interface UserReviewsApiResponse {
  responseMessage?: {
    responseData?: UserReview[]
  }
}

interface HomeTestimonialsProps {
  fallbackTestimonials?: Testimonial[]
  testimonialsSubtitle?: string
}

function toMarqueeItems(testimonials: Testimonial[]): MarqueeReviewItem[] {
  return testimonials.map((t) => ({
    name: t.name,
    content: t.content,
    rating: t.rating,
    role: t.role,
  }))
}

export default function HomeTestimonials({
  fallbackTestimonials = [],
  testimonialsSubtitle,
}: HomeTestimonialsProps) {
  const api = useApiClient()
  const [reviews, setReviews] = useState<Testimonial[]>(fallbackTestimonials)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await api.post<UserReviewsApiResponse>('/api/userreviews', {}, { baseURL: '' })
        const raw = data?.responseMessage?.responseData
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped: Testimonial[] = raw
            .filter((r) => r.isActive && r.reviewText)
            .slice(0, 12)
            .map((r) => ({
              name: r.reviewerName || 'Guest',
              content: r.reviewText,
              rating: typeof r.rating === 'number' ? Math.min(5, Math.max(1, r.rating)) : 5,
            }))
          if (mapped.length > 0) setReviews(mapped)
        }
      } catch {
        // Keep fallback
      }
    }
    fetchReviews()
  }, [api])

  const items = toMarqueeItems(reviews)
  if (items.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4 text-gray-900 opacity-0 animate-fade-up">
          What people are saying
        </h2>
        {testimonialsSubtitle && (
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto opacity-0 animate-fade-up [animation-delay:75ms]">
            {testimonialsSubtitle}
          </p>
        )}
        <ReviewsMarquee items={items} variant="home" className="mt-4" />
      </div>
    </section>
  )
}
