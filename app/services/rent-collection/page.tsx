import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Rent Collection | Rent Setu',
  description: 'Automated rent collection with full transparency. Coming soon.',
}

export default function RentCollectionPage() {
  return <ComingSoon title="Rent Collection" />
}
