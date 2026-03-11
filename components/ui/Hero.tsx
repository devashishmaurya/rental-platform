'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { HeroSection } from '@/config/content'

const DEBOUNCE_MS = 300

/** Parse towns/search API response (array or responseMessage.responseData) */
function parseTownsResponse(data: unknown): string[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'responseMessage' in data) {
    const msg = (data as { responseMessage?: { responseData?: unknown } }).responseMessage
    const arr = msg?.responseData
    return Array.isArray(arr) ? arr : []
  }
  if (data && typeof data === 'object' && 'responseData' in data) {
    const arr = (data as { responseData?: unknown }).responseData
    return Array.isArray(arr) ? arr : []
  }
  return []
}

interface HeroProps {
  content: HeroSection
  className?: string
}

export default function Hero({ content, className = '' }: HeroProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null)

  // Fetch location suggestions (OpenRent-style type-ahead)
  useEffect(() => {
    const keyword = searchQuery.trim()
    if (!keyword) {
      setSuggestions([])
      setDropdownOpen(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      fetch(`/api/listing/towns/search?keyword=${encodeURIComponent(keyword)}`)
        .then((res) => res.json())
        .then((data) => {
          const list = parseTownsResponse(data)
          setSuggestions(list)
          setDropdownOpen(list.length > 0)
        })
        .catch(() => {
          setSuggestions([])
          setDropdownOpen(false)
        })
        .finally(() => setLoading(false))
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  // Position dropdown (for portal) when open
  useEffect(() => {
    if (!dropdownOpen || !inputRef.current) {
      setDropdownRect(null)
      return
    }
    const measure = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setDropdownRect({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        })
      }
    }
    measure()
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [dropdownOpen, suggestions.length])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (wrapperRef.current?.contains(target)) return
      const portal = document.getElementById('hero-location-dropdown-portal')
      if (portal?.contains(target)) return
      setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectLocation = useCallback((location: string) => {
    setSelectedLocation(location)
    setSearchQuery('')
    setSuggestions([])
    setDropdownOpen(false)
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedLocation(null)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const term = selectedLocation || searchQuery.trim()
    if (term) {
      router.push(`/search?term=${encodeURIComponent(term)}`)
    } else {
      router.push('/search')
    }
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

          {/* Search Bar - OpenRent-style: selected location inside the search box only */}
          {content.searchPlaceholder && (
            <div className="mb-4 sm:mb-6 opacity-0 animate-fade-up [animation-delay:200ms] px-2 sm:px-0 overflow-visible" ref={wrapperRef}>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-2 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none">
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
                    ref={inputRef}
                    type="text"
                    value={selectedLocation ?? searchQuery}
                    onChange={(e) => {
                      const v = e.target.value
                      if (selectedLocation) setSelectedLocation(null)
                      setSearchQuery(v)
                    }}
                    placeholder={content.searchPlaceholder}
                    className="w-full pl-11 sm:pl-12 pr-10 sm:pr-10 py-3.5 sm:py-4 rounded-xl sm:rounded-lg text-base sm:text-lg text-gray-900 placeholder:text-gray-600 bg-white/95 backdrop-blur-sm border-2 border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg transition-all duration-200"
                  />
                  {selectedLocation && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-500 hover:text-gray-800 p-1 rounded"
                      aria-label="Clear location"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {/* Dropdown rendered in portal so it's not clipped by hero overflow and clicks always register */}
                  {dropdownOpen && suggestions.length > 0 && dropdownRect &&
                    createPortal(
                      <ul
                        id="hero-location-dropdown-portal"
                        role="listbox"
                        className="fixed rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto z-[9999] text-left"
                        style={{
                          top: dropdownRect.top,
                          left: dropdownRect.left,
                          width: dropdownRect.width,
                        }}
                      >
                        {suggestions.map((item) => (
                          <li
                            key={item}
                            role="option"
                            tabIndex={0}
                            className="px-4 py-3 text-gray-900 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-0 select-none"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleSelectLocation(item)
                            }}
                            onClick={(e) => {
                              e.preventDefault()
                              handleSelectLocation(item)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleSelectLocation(item)
                              }
                            }}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>,
                      document.body
                    )}
                  {loading && searchQuery.trim() && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
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
