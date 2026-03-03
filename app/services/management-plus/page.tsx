import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Management Plus | Rent Setu',
  description: 'End-to-end property management services. Coming soon.',
}

export default function ManagementPlusPage() {
  return <ComingSoon title="Management Plus" />
}
