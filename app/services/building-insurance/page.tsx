import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Building & Contents Insurance | Rent Setu',
  description: 'Building and contents insurance for landlords. Coming soon.',
}

export default function BuildingInsurancePage() {
  return <ComingSoon title="Building & Contents Insurance" />
}
