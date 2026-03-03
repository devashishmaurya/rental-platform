import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Tenancy Creation | Rent Setu',
  description: 'Full tenancy creation and legally compliant contracts. Coming soon.',
}

export default function TenancyCreationPage() {
  return <ComingSoon title="Tenancy Creation" />
}
