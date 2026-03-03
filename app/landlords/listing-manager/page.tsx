import type { Metadata } from 'next'
import ServicePageTemplate from '@/components/ui/ServicePageTemplate'

export const metadata: Metadata = {
  title: 'Listing Manager & Landlord Checklist | Rent Setu',
  description: 'Manage your listings and stay on top of the landlord checklist.',
}

export default function ListingManagerPage() {
  return (
    <ServicePageTemplate
      title="Listing Manager & Landlord Checklist"
      description="Manage your rental listings and use the landlord checklist to stay compliant. APIs will be configured later."
      features={['Listing dashboard', 'Landlord checklist', 'Compliance info']}
      ctaHref="/landlords/add-listing"
      ctaText="Add listing"
    />
  )
}
