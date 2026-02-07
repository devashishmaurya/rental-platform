import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import FeatureGrid from '@/components/ui/FeatureGrid'
import FAQ from '@/components/ui/FAQ'
import type { Metadata } from 'next'

const pageContent = getPageContent('about-tenants')

if (!pageContent) {
  throw new Error('About Tenants page content not found')
}

export const metadata: Metadata = generatePageMetadata(pageContent.seo)

export default function AboutTenantsPage() {
  return (
    <>
      {pageContent.hero && <Hero content={pageContent.hero} />}
      
      {pageContent.features && (
        <FeatureGrid features={pageContent.features} columns={3} />
      )}

      {pageContent.faq && <FAQ items={pageContent.faq} />}
    </>
  )
}
