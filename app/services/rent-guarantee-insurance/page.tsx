import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Rent Guarantee Insurance (RGI) | Rent Setu',
  description: 'Rent guarantee and landlord insurance. Coming soon.',
}

export default function RentGuaranteeInsurancePage() {
  return <ComingSoon title="Rent Guarantee Insurance (RGI)" />
}
