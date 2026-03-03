'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useApiClient } from '@/lib/api/useApiClient'
import ReviewsMarquee from '@/components/ui/ReviewsMarquee'

interface PricingPackage {
  id: string
  name: string
  price: number
  originalPrice?: number
  currency: string
  period: string
  popular?: boolean
  badge?: string
  features: string[]
  portals: string[]
  ctaText: string
  ctaHref: string
  description?: string
}

interface PropertyStats {
  averageDaysToLet: number
  totalListings: number
  successRate: number
}

/** API response types for backend packages API (NEXT_PUBLIC_API_URL or /api/packages proxy) */
interface ApiPortal {
  portalId: number
  portalName: string
  logoUrl?: string
  portalOptional?: boolean
  portalOrder?: number
}

interface ApiFeature {
  featureId: number
  featureName: string
  featureOptional?: boolean
  featureOrder?: number
  hoverContent?: { hoverTitle?: string; hoverDescription?: string; iconUrl?: string | null }
}

interface ApiPackage {
  packageId: number
  packageName: string
  badgeText: string | null
  currency: string
  description: string
  displayOrder: number
  features: ApiFeature[]
  originalPrice: number | null
  portals: ApiPortal[]
  price: number
  upfrontSavingText: string | null
}

interface PackagesApiResponse {
  responseMessage: {
    responseData: ApiPackage[]
    status?: number
    message?: string
  }
}

/** User review from POST /api/userreviews (proxy → backend) */
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
  responseMessage: {
    responseData: UserReview[]
    status?: number
    message?: string
  }
}

// Use same-origin proxy when NEXT_PUBLIC_API_URL is set; frontend calls /api/packages, server proxies to backend
const PACKAGES_API_URL = process.env.NEXT_PUBLIC_API_URL ? '/api/packages' : ''

/** Map API package to UI PricingPackage */
function mapApiPackageToPricing(apiPkg: ApiPackage): PricingPackage {
  const isPopular = apiPkg.badgeText === 'Most Popular'
  const currencySymbol = apiPkg.currency === 'GBP' ? '£' : apiPkg.currency === 'INR' ? '₹' : apiPkg.currency
  return {
    id: String(apiPkg.packageId),
    name: apiPkg.packageName,
    price: apiPkg.price,
    originalPrice: apiPkg.originalPrice ?? undefined,
    currency: currencySymbol,
    period: apiPkg.price === 0 ? 'Free Forever' : 'One-time payment',
    popular: isPopular,
    badge: apiPkg.badgeText ?? undefined,
    features: (apiPkg.features ?? []).map((f) => f.featureName).filter(Boolean),
    portals: (apiPkg.portals ?? []).map((p) => p.portalName).filter(Boolean),
    ctaText: apiPkg.price === 0 ? 'Get Started Free' : 'Choose Package',
    ctaHref: '/landlords/add-listing',
    description: apiPkg.description || undefined,
  }
}

const FALLBACK_TESTIMONIALS = [
  { name: 'Rajesh Kumar', location: 'Mumbai', rating: 5, text: 'Found tenants within 3 days! The portal advertising package is worth every rupee.' },
  { name: 'Priya Sharma', location: 'Bangalore', rating: 5, text: 'Easy to use platform with excellent support. My property was listed on all major portals.' },
  { name: 'Amit Patel', location: 'Delhi', rating: 5, text: 'The free package worked great for me. Upgraded to portal advertising and got even better results.' },
]

export default function PropertyAdvertisingPage() {
  const api = useApiClient()
  const [stats, setStats] = useState<PropertyStats | null>(null)
  const [packages, setPackages] = useState<PricingPackage[]>([])
  const [reviews, setReviews] = useState<{ name: string; location: string; rating: number; text: string }[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch packages from API via /api/packages (proxy to backend when NEXT_PUBLIC_API_URL is set)
  useEffect(() => {
    const fetchPackages = async () => {
      if (!PACKAGES_API_URL) {
        console.warn('NEXT_PUBLIC_API_URL not set; packages API disabled')
        setPackages([])
        setLoading(false)
        return
      }
      try {
        console.log('Fetching packages from:', PACKAGES_API_URL)
        // API returns { responseMessage: { responseData: ApiPackage[] } } (via /api/packages proxy)
        const data = await api.get<PackagesApiResponse>(PACKAGES_API_URL, { baseURL: '' })
        console.log('Packages API response:', data)
        const raw = data?.responseMessage?.responseData
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map(mapApiPackageToPricing)
          setPackages(mapped)
        } else {
          setPackages([])
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch packages from API:', error)
        setPackages([])
        setLoading(false)
      }
    }

    fetchPackages()
  }, [api])

  // Fetch stats from API (can use OpenRent API or your own)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Replace with your API endpoint when ready
        // Example: const data = await api.get<PropertyStats>('/api/property-advertising/stats')
        // For now, using dummy data - replace with actual API call
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Dummy data - replace with: setStats(data)
        setStats({
          averageDaysToLet: 7,
          totalListings: 125000,
          successRate: 98,
        })
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Fallback to default stats
        setStats({
          averageDaysToLet: 7,
          totalListings: 125000,
          successRate: 98,
        })
        setLoading(false)
      }
    }

    fetchStats()
  }, [api])

  // Fetch user reviews via same-origin proxy (same pattern as packages)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await api.post<UserReviewsApiResponse>('/api/userreviews', {}, { baseURL: '' })
        const raw = data?.responseMessage?.responseData
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw
            .filter((r) => r.isActive && r.reviewText)
            .slice(0, 12)
            .map((r) => ({
              name: r.reviewerName || 'Guest',
              location: '',
              rating: typeof r.rating === 'number' ? Math.min(5, Math.max(1, r.rating)) : 5,
              text: r.reviewText,
            }))
          if (mapped.length > 0) setReviews(mapped)
        }
      } catch {
        // Keep default empty; testimonials section will use fallback
      }
    }
    fetchReviews()
  }, [api])

  const testimonials = reviews.length > 0 ? reviews : FALLBACK_TESTIMONIALS

  const faqs = [
    {
      question: 'Is the free package really free?',
      answer: 'Yes! There\'s no commitment to upgrade later. You can list your property on Rent Setu completely free forever. If you want to expand your reach to other portals, you can upgrade anytime for just ₹999.',
    },
    {
      question: 'How long will it take to create my listing?',
      answer: 'It takes less than 5 minutes to set up your property listing. Once submitted, your listing will be live within 2-4 hours. Many landlords receive multiple enquiries on the same day.',
    },
    {
      question: 'How long will my listing remain online?',
      answer: 'We advertise your property until it\'s let. On average, landlords find tenants within 7 days. We provide ongoing support to ensure your listing attracts quality enquiries.',
    },
    {
      question: 'Can I upgrade my package later?',
      answer: 'Yes! You can upgrade from free to portal advertising, or add complete tenancy services at any time while your listing is active. Our flexible system gives you full control.',
    },
    {
      question: 'Which cities do you cover?',
      answer: 'We cover all major cities across India including Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, and many more. Our portal partnerships ensure maximum reach nationwide.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods including UPI, Credit/Debit cards, Net Banking, and digital wallets. All transactions are secure and encrypted.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Premium Design */}
      <section className="relative bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white overflow-hidden">
        {/* Background Pattern/Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-green rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-5xl mx-auto">
            {/* Badge/Tag */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                <svg className="w-4 h-4 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Trusted by 1,25,000+ Landlords Across India
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-center leading-tight">
              <span className="block">Advertise Your Property</span>
              <span className="block bg-gradient-to-r from-accent-green via-green-300 to-accent-green bg-clip-text text-transparent">
                Without Any Brokerage
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-white/90 mb-4 text-center max-w-3xl mx-auto leading-relaxed">
              List on India's top property portals. Find quality tenants fast. 
              <span className="block mt-2 text-lg text-white/80">
                No hidden fees. No credit card required. You stay in control.
              </span>
            </p>

            {/* Key Benefits - Premium Icons */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-10 mt-8">
              <div className="flex items-center gap-2 text-white/90">
                <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium">100% Free Option</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-medium">Average 7 Days to Let</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="font-medium">No Hidden Charges</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
              <Link
                href="/landlords/add-listing"
                className="group relative px-8 py-4 bg-accent-green hover:bg-accent-green-hover text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Advertising Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-green to-green-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg transition-all duration-300 border-2 border-white/30 hover:border-white/50 hover:scale-105 transform"
              >
                View Pricing & Packages
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>4.8/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span>1,25,000+ Active Listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>98% Success Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      {stats && (
        <section className="bg-primary-50 py-6 border-b border-primary-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-900">{stats.averageDaysToLet}</div>
                <div className="text-sm text-gray-600">Average days to let</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-900">
                  {stats.totalListings.toLocaleString('en-IN')}+
                </div>
                <div className="text-sm text-gray-600">Active listings</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-900">{stats.successRate}%</div>
                <div className="text-sm text-gray-600">Success rate</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Packages */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pick a package that works for you
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you simply need advertising or want complete tenancy services, we've got a package to match.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.length > 0 ? (
              packages.map((pkg) => (
                <PricingCard
                  key={pkg.id}
                  package={pkg}
                  onSelect={() => {
                    // Handle card selection if needed
                    console.log('Selected package:', pkg.id)
                  }}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">Loading packages...</div>
            )}
          </div>
        </div>
      </section>

      {/* Portal Logos Section */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600 mb-6">
              We advertise on India's top property portals
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
              <div className="text-2xl font-bold text-gray-700">MagicBricks</div>
              <div className="text-2xl font-bold text-gray-700">99acres</div>
              <div className="text-2xl font-bold text-gray-700">Housing.com</div>
              <div className="text-2xl font-bold text-gray-700">CommonFloor</div>
              <div className="text-2xl font-bold text-primary-600">Rent Setu</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Why Choose Rent Setu?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Wide Reach',
                  description: 'List on India\'s top property portals including MagicBricks, 99acres, Housing.com, and 100+ partner sites.',
                  icon: '📡',
                },
                {
                  title: 'No Hidden Fees',
                  description: 'Transparent pricing with no surprise charges. What you see is what you pay.',
                  icon: '💰',
                },
                {
                  title: 'Fast Results',
                  description: 'Average 7 days to find tenants. Most landlords receive enquiries on the same day.',
                  icon: '⚡',
                },
                {
                  title: 'Complete Control',
                  description: 'You manage viewings and tenant selection. We handle the advertising and paperwork.',
                  icon: '🎛️',
                },
                {
                  title: 'Legal Compliance',
                  description: 'All rental agreements and documents comply with Indian rental laws and regulations.',
                  icon: '📋',
                },
                {
                  title: '24/7 Support',
                  description: 'Our support team is available round the clock to help you with any queries.',
                  icon: '🆘',
                },
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="text-4xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <FAQItem key={idx} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section — marquee (OpenRent style) */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              What landlords are saying
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Join thousands of satisfied landlords across India
            </p>
            <ReviewsMarquee
              items={testimonials.map((t) => ({
                name: t.name,
                text: t.text,
                rating: t.rating,
                location: t.location,
              }))}
              variant="landlords"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary-950 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to list your property?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of landlords who trust Rent Setu to find quality tenants quickly and efficiently.
          </p>
          <Link
            href="/landlords/add-listing"
            className="inline-block bg-accent-green hover:bg-accent-green-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
          >
            Start Listing Now - It's Free
          </Link>
          <p className="mt-4 text-sm text-white/70">
            You can edit your listing anytime or remove it at no cost
          </p>
        </div>
      </section>
    </div>
  )
}

function PricingCard({ package: pkg, onSelect }: { package: PricingPackage; onSelect?: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`relative bg-white rounded-xl shadow-lg p-8 transition-all hover:shadow-xl overflow-visible cursor-pointer flex flex-col h-full ${
        pkg.popular
          ? 'border-4 border-accent-green'
          : 'border-2 border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Badge - show for all packages if they have one */}
      {pkg.badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <span
            className={`px-4 py-1 rounded-full text-sm font-semibold shadow-lg ${
              pkg.popular
                ? 'bg-accent-green text-white'
                : 'bg-primary-600 text-white'
            }`}
          >
            {pkg.badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900">
            {pkg.currency}
            {pkg.price.toLocaleString('en-IN')}
          </span>
          {pkg.originalPrice && (
            <span className="text-xl text-gray-500 line-through">
              {pkg.currency}
              {pkg.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{pkg.period}</p>
        {pkg.description && (
          <p className="text-sm text-gray-500 mt-2">{pkg.description}</p>
        )}
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Advertise on:</p>
        <div className="space-y-2">
          {pkg.portals.map((portal, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{portal}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 flex-grow">
        <p className="text-sm font-semibold text-gray-700 mb-3">Key features:</p>
        <ul className="space-y-2">
          {pkg.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto">
        <Link
          href={pkg.ctaHref}
          onClick={(e) => e.stopPropagation()}
          className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
            pkg.popular
              ? 'bg-accent-green hover:bg-accent-green-hover text-white shadow-lg'
              : pkg.price === 0
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-900 hover:bg-gray-800 text-white'
          }`}
        >
          {pkg.ctaText}
        </Link>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-4 text-gray-600 border-t border-gray-200">{answer}</div>
      )}
    </div>
  )
}
