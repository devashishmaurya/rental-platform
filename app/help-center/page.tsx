import { getPageContent } from '@/config/content'
import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import Hero from '@/components/ui/Hero'
import FAQ from '@/components/ui/FAQ'
import type { Metadata } from 'next'

const pageContent = getPageContent('help-center')

if (!pageContent) {
  throw new Error('Help Center page content not found')
}

export const metadata: Metadata = generatePageMetadata(pageContent.seo)

export default function HelpCenterPage() {
  return (
    <>
      {pageContent.hero && <Hero content={pageContent.hero} />}
      
      {pageContent.faq && <FAQ items={pageContent.faq} />}
    </>
  )
}
