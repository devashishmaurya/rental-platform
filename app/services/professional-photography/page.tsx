import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Professional Photography | Rent Setu',
  description: 'Pro photos and floor plans for property listings. Coming soon.',
}

export default function ProfessionalPhotographyPage() {
  return <ComingSoon title="Professional Photography" />
}
