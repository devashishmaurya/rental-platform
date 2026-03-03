import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const pageContent = getPageContent('contact')

export const metadata: Metadata = pageContent
  ? generatePageMetadata(pageContent.seo)
  : { title: 'Contact' }

export default function ContactPage() {
  if (!pageContent) notFound()
  const content = pageContent!
  return (
    <>
      {content.hero && <Hero content={content.hero} />}
      
      {content.content?.sections && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-50 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Get in Touch
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                    <a
                      href="mailto:support@rental-platform.com"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      support@rental-platform.com
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                    <a
                      href="tel:+441234567890"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      +44 (0) 123 456 7890
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                    <p className="text-gray-700">
                      123 Rental Street<br />
                      London, UK<br />
                      SW1A 1AA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
