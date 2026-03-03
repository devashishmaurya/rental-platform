import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Energy Performance Certificates (EPC) | Rent Setu',
  description: 'EPC certificates for rental properties. Coming soon.',
}

export default function EpcPage() {
  return <ComingSoon title="Energy Performance Certificates (EPC)" />
}
