import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import FeatureGrid from '@/components/ui/FeatureGrid'
import type { Metadata } from 'next'

const pageContent = getPageContent('what-we-do')

if (!pageContent) {
  throw new Error('What We Do page content not found')
}

export const metadata: Metadata = generatePageMetadata(pageContent.seo)

export default function WhatWeDoPage() {
  return (
    <>
      {pageContent.hero && <Hero content={pageContent.hero} />}
      
      {pageContent.features && (
        <FeatureGrid features={pageContent.features} columns={3} />
      )}
    </>
  )
}
