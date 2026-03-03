import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Electrical Safety Certificates | Rent Setu',
  description: 'Electrical safety certificates for rental properties. Coming soon.',
}

export default function ElectricalSafetyPage() {
  return <ComingSoon title="Electrical Safety Certificates" />
}
