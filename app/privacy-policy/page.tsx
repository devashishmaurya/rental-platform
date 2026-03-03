import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const pageContent = getPageContent('privacy-policy')

export const metadata: Metadata = pageContent
  ? generatePageMetadata(pageContent.seo)
  : { title: 'Privacy Policy' }

export default function PrivacyPolicyPage() {
  if (!pageContent) notFound()
  const content = pageContent!
  return (
    <>
      {content.hero && <Hero content={content.hero} />}
      
      {content.content?.sections && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              {content.content.sections.map((section, index) => (
                <div key={index} className="prose prose-lg max-w-none">
                  {section.title && (
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                      {section.title}
                    </h2>
                  )}
                  <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
