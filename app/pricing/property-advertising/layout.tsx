import { generateMetadata as generatePageMetadata } from '@/lib/seo/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Property Advertising | Rent Setu - List Your Property on Top Portals',
  description: 'Advertise your rental property on MagicBricks, 99acres, Housing.com and 100+ portals. Free listing option available. Find tenants fast with India\'s trusted rental platform.',
  keywords: ['property advertising', 'list property', 'rent property', 'MagicBricks', '99acres', 'Housing.com', 'property listing', 'India'],
  ogTitle: 'Property Advertising - Rent Setu',
  ogDescription: 'Advertise your property on India\'s top portals. Free and premium packages available.',
  ogType: 'website',
})

export default function PropertyAdvertisingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
