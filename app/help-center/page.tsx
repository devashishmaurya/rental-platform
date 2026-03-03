import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import FAQ from '@/components/ui/FAQ'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const pageContent = getPageContent('help-center')

export const metadata: Metadata = pageContent
  ? generatePageMetadata(pageContent.seo)
  : { title: 'Help Center' }

export default function HelpCenterPage() {
  if (!pageContent) notFound()
  const content = pageContent!
  return (
    <>
      {content.hero && <Hero content={content.hero} />}
      
      {content.faq && <FAQ items={content.faq} />}
    </>
  )
}
