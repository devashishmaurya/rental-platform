import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import FeatureGrid from '@/components/ui/FeatureGrid'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const pageContent = getPageContent('what-we-do')

export const metadata: Metadata = pageContent
  ? generatePageMetadata(pageContent.seo)
  : { title: 'What We Do' }

export default function WhatWeDoPage() {
  if (!pageContent) notFound()
  const content = pageContent!
  return (
    <>
      {content.hero && <Hero content={content.hero} />}
      {content.features && (
        <FeatureGrid features={content.features} columns={3} />
      )}
    </>
  )
}
