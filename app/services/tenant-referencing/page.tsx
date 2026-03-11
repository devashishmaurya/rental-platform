import type { Metadata } from 'next'
import { TenantReferencingContent } from '@/components/services/TenantReferencingContent'

export const metadata: Metadata = {
  title: 'Tenant Referencing | Rent Setu',
  description:
    'Comprehensive tenant referencing and background checks for landlords – modelled on OpenRent’s Referencing service.',
}

export default function TenantReferencingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <TenantReferencingContent />
    </div>
  )
}
