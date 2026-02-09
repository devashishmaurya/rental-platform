import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import FeatureGrid from '@/components/ui/FeatureGrid'
import FAQ from '@/components/ui/FAQ'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const pageContent = getPageContent('about-landlords')

export const metadata: Metadata = pageContent
  ? generatePageMetadata(pageContent.seo)
  : { title: 'About Landlords' }

export default function AboutLandlordsPage() {
  if (!pageContent) {
    notFound()
  }
  return (
    <>
      {pageContent.hero && <Hero content={pageContent.hero} />}

      {pageContent.features && (
        <FeatureGrid features={pageContent.features} columns={2} />
      )}

      {pageContent.faq && <FAQ items={pageContent.faq} />}
    </>
  )
}
