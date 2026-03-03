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
    const q = searchQuery.trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  const heroImage = content.backgroundImage || content.image

  return (
    <section
      className={`hero relative bg-primary-950 text-white overflow-hidden ${className}`}
      style={{ backgroundColor: 'var(--color-primary-950, #0a3d5c)' }}
    >
      {heroImage && (
        <>
          <img
            src={heroImage}
            alt=""
            className="hero__image absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-75"
            width={1560}
            height={400}
            fetchPriority="high"
          />
          {/* Premium gradient overlay - enhances readability and adds depth */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-primary-950/60 via-primary-950/50 to-primary-950/70 pointer-events-none"
            aria-hidden
          />
          {/* Additional subtle overlay for premium look */}
          <div
            className="absolute inset-0 bg-primary-950/30 pointer-events-none"
            aria-hidden
          />
        </>
      )}
      <div className="container relative z-10 mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Main Headline - optimized for mobile */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-3 sm:mb-4 leading-tight tracking-tight opacity-0 animate-fade-up text-white drop-shadow-lg">
              {content.title}
            </h1>
            {content.description && (
              <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto font-normal opacity-0 animate-fade-up [animation-delay:100ms] px-2 sm:px-0 leading-relaxed drop-shadow-md">
                {content.description}
              </p>
            )}
          </div>

          {/* Search Bar - mobile optimized */}
          {content.searchPlaceholder && (
            <div className="mb-4 sm:mb-6 opacity-0 animate-fade-up [animation-delay:200ms] px-2 sm:px-0">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-2 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
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
                    className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-4 rounded-xl sm:rounded-lg text-base sm:text-lg bg-white/95 backdrop-blur-sm border-2 border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg transition-all duration-200"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 whitespace-nowrap border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {content.searchButtonText || 'Search'}
                </button>
              </form>
            </div>
          )}

          {/* Social Proof - mobile optimized */}
          {content.socialProof && (
            <div className="text-center opacity-0 animate-fade-in [animation-delay:400ms] px-2 sm:px-0">
              <p className="text-sm sm:text-base text-white/90 font-normal drop-shadow-sm">
                {content.socialProof}
              </p>
            </div>
          )}

          {/* CTAs (if no search bar) - mobile optimized */}
          {!content.searchPlaceholder && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-6 sm:mt-8 px-2 sm:px-0">
              {content.primaryCTA && (
                <Link
                  href={content.primaryCTA.href}
                  className="w-full sm:w-auto bg-white text-primary-700 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-lg font-semibold text-base sm:text-lg hover:bg-primary-50 active:bg-primary-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                >
                  {content.primaryCTA.text}
                </Link>
              )}
              {content.secondaryCTA && (
                <Link
                  href={content.secondaryCTA.href}
                  className="w-full sm:w-auto bg-transparent border-2 border-white/90 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-lg font-semibold text-base sm:text-lg hover:bg-white/15 active:bg-white/20 transition-all duration-200 backdrop-blur-sm text-center"
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
