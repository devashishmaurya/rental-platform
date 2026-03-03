import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Gas Safety Certificates | Rent Setu',
  description: 'Gas safety certificates for rental properties. Coming soon.',
}

export default function GasSafetyPage() {
  return <ComingSoon title="Gas Safety Certificates" />
}
