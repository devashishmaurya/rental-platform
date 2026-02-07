import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import type { Metadata } from 'next'

const pageContent = getPageContent('what-we-are')

if (!pageContent) {
  throw new Error('What We Are page content not found')
}

export const metadata: Metadata = generatePageMetadata(pageContent.seo)

export default function WhatWeArePage() {
  return (
    <>
      {pageContent.hero && <Hero content={pageContent.hero} />}
      
      {pageContent.content?.sections && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              {pageContent.content.sections.map((section, index) => (
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
