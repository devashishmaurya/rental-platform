/**
 * Dashboard and Landlord Services navigation.
 * Used by dashboard layout (secondary nav, sidebars) and Landlord Services page.
 */

export const SECONDARY_NAV = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Account', href: '/dashboard/account/edit' },
  { name: 'Landlord Services', href: '/dashboard/landlord-services' },
] as const

/** Sidebar links when on Dashboard section */
export const DASHBOARD_SIDEBAR = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Favourites', href: '/dashboard/favourites' },
  { name: 'Saved Searches', href: '/dashboard/saved-searches' },
  { name: 'Your Enquiries', href: '/dashboard/enquiries' },
  { name: 'Verified Tenant', href: '/dashboard/verified-tenant' },
] as const

/** Sidebar links when on Account section */
export const ACCOUNT_SIDEBAR = [
  { name: 'Edit Details', href: '/dashboard/account/edit' },
  { name: 'My Photo', href: '/dashboard/account/photo' },
  { name: 'Credits', href: '/dashboard/account/credits' },
  { name: 'Delete Account', href: '/dashboard/account/delete' },
] as const

/** Landlord services for sidebar and grid (same order as OpenRent-style) */
export const LANDLORD_SERVICES = [
  { name: 'Property Advertising', href: '/pricing/property-advertising', slug: 'property-advertising' },
  { name: 'Tenancy Creation', href: '/services/tenancy-creation', slug: 'tenancy-creation' },
  { name: 'Referencing', href: '/services/tenant-referencing', slug: 'tenant-referencing' },
  { name: 'Management Plus', href: '/services/management-plus', slug: 'management-plus' },
  { name: 'Rent Collection', href: '/services/rent-collection', slug: 'rent-collection' },
  { name: 'Rent Insurance', href: '/services/rent-guarantee-insurance', slug: 'rent-guarantee-insurance' },
  { name: 'Inventory', href: '/services/inventory', slug: 'inventory' },
  { name: 'Gas Safety', href: '/services/gas-safety', slug: 'gas-safety' },
  { name: 'Electrical Safety', href: '/services/electrical-safety', slug: 'electrical-safety' },
  { name: 'EPC', href: '/services/epc', slug: 'epc' },
  { name: 'Photography', href: '/services/professional-photography', slug: 'professional-photography' },
  { name: 'Building Insurance', href: '/services/building-insurance', slug: 'building-insurance' },
  { name: 'Deposit Scheme', href: '/services/deposit-scheme', slug: 'deposit-scheme' },
  { name: 'Serve Notice (Section 21)', href: '/services/serve-notice-section21', slug: 'serve-notice-section21' },
  { name: 'Renewal Reminder', href: '/services/renewal-reminder', slug: 'renewal-reminder' },
] as const
