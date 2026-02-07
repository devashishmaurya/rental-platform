'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { HeroSection } from '@/config/content'

interface HeroProps {
  content: HeroSection
  className?: string
}

export default function Hero({ content, className = '' }: HeroProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const heroImage = content.backgroundImage || content.image

  return (
    <section
      className={`hero relative bg-primary-950 text-white overflow-hidden ${className}`}
      style={{ backgroundColor: 'var(--color-primary-950, #0a3d5c)' }}
    >
      {heroImage && (
        <img
          src={heroImage}
          alt=""
          className="hero__image absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-50"
          width={1560}
          height={400}
          fetchPriority="high"
        />
      )}
      <div className="container relative z-10 mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Main Headline - unified with nav/home typography (DM Sans, semibold, balanced scale) */}
          <div className="text-center mb-8">
            <h1 className="text-hero-title md:text-4xl lg:text-5xl font-semibold mb-4 leading-tight tracking-tight">
              {content.title}
            </h1>
            {content.description && (
              <p className="text-hero-lead md:text-xl text-white/90 max-w-2xl mx-auto font-normal">
                {content.description}
              </p>
            )}
          </div>

          {/* Search Bar */}
          {content.searchPlaceholder && (
            <div className="mb-6">
              <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={content.searchPlaceholder}
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors whitespace-nowrap"
                >
                  {content.searchButtonText || 'Search'}
                </button>
              </form>
            </div>
          )}

          {/* Social Proof */}
          {content.socialProof && (
            <div className="text-center">
              <p className="text-sm md:text-base text-white/80 font-normal">
                {content.socialProof}
              </p>
            </div>
          )}

          {/* CTAs (if no search bar) */}
          {!content.searchPlaceholder && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              {content.primaryCTA && (
                <Link
                  href={content.primaryCTA.href}
                  className="bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg"
                >
                  {content.primaryCTA.text}
                </Link>
              )}
              {content.secondaryCTA && (
                <Link
                  href={content.secondaryCTA.href}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
                >
                  {content.secondaryCTA.text}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
