import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Serve Notice (Section 21) | Rent Setu',
  description: 'Section 21 notice serving for landlords. Coming soon.',
}

export default function ServeNoticeSection21Page() {
  return <ComingSoon title="Serve Notice (Section 21)" />
}
