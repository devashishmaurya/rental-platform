import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Inventory & Check-in | Rent Setu',
  description: 'Inventory and check-in reports for landlords. Coming soon.',
}

export default function InventoryPage() {
  return <ComingSoon title="Inventory & Check-in" />
}
