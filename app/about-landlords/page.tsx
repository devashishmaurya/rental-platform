import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import FeatureGrid from '@/components/ui/FeatureGrid'
import FAQ from '@/components/ui/FAQ'
import type { Metadata } from 'next'

const pageContent = getPageContent('about-landlords')

if (!pageContent) {
  throw new Error('About Landlords page content not found')
}

export const metadata: Metadata = generatePageMetadata(pageContent.seo)

export default function AboutLandlordsPage() {
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
