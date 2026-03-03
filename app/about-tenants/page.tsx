import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import FeatureGrid from '@/components/ui/FeatureGrid'
import FAQ from '@/components/ui/FAQ'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const pageContent = getPageContent('about-tenants')

export const metadata: Metadata = pageContent
  ? generatePageMetadata(pageContent.seo)
  : { title: 'About Tenants' }

export default function AboutTenantsPage() {
  if (!pageContent) notFound()
  const content = pageContent!
  return (
    <>
      {content.hero && <Hero content={content.hero} />}

      {content.features && (
        <FeatureGrid features={content.features} columns={3} />
      )}

      {content.faq && <FAQ items={content.faq} />}
    </>
  )
}
