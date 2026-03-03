import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Deposit Scheme | Rent Setu',
  description: 'Deposit protection scheme for tenancies. Coming soon.',
}

export default function DepositSchemePage() {
  return <ComingSoon title="Deposit Scheme" />
}
