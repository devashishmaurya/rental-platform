'use client'

import SecondaryNavLayout from '@/components/layout/SecondaryNavLayout'
import { LANDLORD_SERVICES } from '@/config/dashboard'

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SecondaryNavLayout sidebarLinks={LANDLORD_SERVICES}>
      {children}
    </SecondaryNavLayout>
  )
}
