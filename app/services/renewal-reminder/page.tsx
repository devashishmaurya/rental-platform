import type { Metadata } from 'next'
import ComingSoon from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'Renewal Reminder | Rent Setu',
  description: 'Tenancy renewal reminders for landlords. Coming soon.',
}

export default function RenewalReminderPage() {
  return <ComingSoon title="Renewal Reminder" />
}
