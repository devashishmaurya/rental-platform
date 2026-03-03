import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import HomeAudienceSection from '@/components/ui/HomeAudienceSection'
import PortalLogos from '@/components/ui/PortalLogos'
import HomeTestimonials from '@/components/ui/HomeTestimonials'
import FeaturedProperties from '@/components/ui/FeaturedProperties'
import PressSection from '@/components/ui/PressSection'
import PopularLocations from '@/components/ui/PopularLocations'
import CTA from '@/components/ui/CTA'
import type { Metadata } from 'next'

const pageContent = getPageContent('home')
if (!pageContent) {
  throw new Error('Home page content not found')
}
const content = pageContent

export const metadata: Metadata = generatePageMetadata(content.seo)

export default function HomePage() {
  return (
    <>
      {content.hero && <Hero content={content.hero} />}

      {/* Stats / social proof strip - matches Figma banner */}
      <section
        className="py-6 text-white text-center opacity-0 animate-fade-up [animation-delay:150ms]"
        style={{ backgroundColor: '#0a3d5c' }}
      >
        <div className="container mx-auto px-4">
          <p className="text-lg font-medium">
            1 Lakh+ Tenants and Landlords · Rent Setu
          </p>
        </div>
      </section>

      <HomeAudienceSection />
      <PortalLogos />

      {/* Testimonials / User reviews (API-driven with fallback from content) */}
      <HomeTestimonials
        fallbackTestimonials={content.testimonials}
        testimonialsSubtitle={content.testimonialsSubtitle}
      />

      <FeaturedProperties />
      {/* <PressSection /> */}
      <PopularLocations />

      {content.cta && <CTA content={content.cta} />}
    </>
  )
}
