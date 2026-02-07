import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import HomeAudienceSection from '@/components/ui/HomeAudienceSection'
import PortalLogos from '@/components/ui/PortalLogos'
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

      {/* Stats / social proof strip */}
      <section className="py-6 bg-primary-950 text-white text-center">
        <div className="container mx-auto px-4">
          <p className="text-lg font-medium">
            1 Lakh+ Tenants and Landlords · RentalPlatform
          </p>
        </div>
      </section>

      <HomeAudienceSection />
      <PortalLogos />

      {/* Testimonials */}
      {content.testimonials && content.testimonials.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4 text-gray-900">
              What people are saying
            </h2>
            {content.testimonialsSubtitle && (
              <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                {content.testimonialsSubtitle}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center mb-4">
                    {testimonial.rating && (
                      <div className="flex text-yellow-400" aria-hidden>
                        {'★'.repeat(testimonial.rating)}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                    {testimonial.role && (
                      <span className="text-gray-600 font-normal">
                        {' '}— {testimonial.role}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <FeaturedProperties />
      {/* <PressSection /> */}
      <PopularLocations />

      {content.cta && <CTA content={content.cta} />}
    </>
  )
}
