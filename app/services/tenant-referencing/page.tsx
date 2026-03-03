import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Tenant Referencing | Rent Setu',
  description: 'Comprehensive tenant referencing and background checks for landlords. Coming soon.',
}

export default function TenantReferencingPage() {
  return <ComingSoon title="Tenant Referencing" />
}
