/**
 * Property Advertising API utilities
 * 
 * TODO: Replace with actual API endpoints when backend is ready
 * For now, these functions are prepared for future API integration
 */

import { useApiClient } from './useApiClient'

export interface PropertyStats {
  averageDaysToLet: number
  totalListings: number
  successRate: number
  totalTenantsFound: number
  averageResponseTime: string
}

export interface PricingPackage {
  id: string
  name: string
  price: number
  originalPrice?: number
  currency: string
  period: string
  popular?: boolean
  features: string[]
  portals: string[]
  ctaText: string
  ctaHref: string
  description?: string
}

/**
 * Fetch property advertising statistics
 * 
 * Example API endpoint: GET /api/property-advertising/stats
 * 
 * When API is ready, uncomment and use:
 * 
 * export async function getPropertyStats(): Promise<PropertyStats> {
 *   const api = useApiClient()
 *   return await api.get<PropertyStats>('/api/property-advertising/stats')
 * }
 */

/**
 * Fetch available pricing packages
 * 
 * Example API endpoint: GET /api/pricing/packages
 * 
 * When API is ready, uncomment and use:
 * 
 * export async function getPricingPackages(): Promise<PricingPackage[]> {
 *   const api = useApiClient()
 *   return await api.get<PricingPackage[]>('/api/pricing/packages')
 * }
 */

/**
 * Submit property listing
 * 
 * Example API endpoint: POST /api/properties
 * 
 * When API is ready, uncomment and use:
 * 
 * export async function createPropertyListing(data: PropertyListingData): Promise<PropertyListing> {
 *   const api = useApiClient()
 *   return await api.post<PropertyListing>('/api/properties', data)
 * }
 */

// Dummy data for development (remove when API is ready)
export const dummyStats: PropertyStats = {
  averageDaysToLet: 7,
  totalListings: 125000,
  successRate: 98,
  totalTenantsFound: 500000,
  averageResponseTime: '2-4 hours',
}

export const dummyPackages: PricingPackage[] = [
  {
    id: 'free',
    name: 'Rent Setu Advertising',
    price: 0,
    currency: '₹',
    period: 'Free Forever',
    features: [
      'Advertise on Rent Setu platform',
      'Unlimited property listings',
      'Direct tenant enquiries',
      'Property management dashboard',
      'No hidden fees',
      'No credit card required',
    ],
    portals: ['Rent Setu'],
    ctaText: 'Get Started Free',
    ctaHref: '/landlords/add-listing',
    description: 'Start advertising your property completely free',
  },
  {
    id: 'portal',
    name: 'Portal Advertising',
    price: 999,
    currency: '₹',
    period: 'One-time payment',
    popular: true,
    features: [
      'Everything in Free package',
      'List on MagicBricks',
      'List on 99acres',
      'List on Housing.com',
      'List on CommonFloor',
      'List on 100+ partner sites',
      'Premium listing placement',
      'Priority customer support',
    ],
    portals: ['Rent Setu', 'MagicBricks', '99acres', 'Housing.com', 'CommonFloor', '100+ Partner Sites'],
    ctaText: 'Start Advertising',
    ctaHref: '/landlords/add-listing',
    description: 'Maximum exposure across India\'s top property portals',
  },
  {
    id: 'complete',
    name: 'Complete Tenancy Package',
    price: 1999,
    originalPrice: 3999,
    currency: '₹',
    period: 'One-time payment',
    features: [
      'Everything in Portal Advertising',
      'Tenant referencing & verification',
      'Rental agreement drafting',
      'Online document signing',
      'Deposit collection & protection',
      'First month rent collection',
      'Legal compliance documents',
      'Tenancy document serving',
      '24/7 support',
    ],
    portals: ['Rent Setu', 'MagicBricks', '99acres', 'Housing.com', 'CommonFloor', '100+ Partner Sites'],
    ctaText: 'Get Complete Package',
    ctaHref: '/landlords/add-listing',
    description: 'Full tenancy services from listing to move-in',
  },
]
