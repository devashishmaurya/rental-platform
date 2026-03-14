/**
 * API endpoints – replace with your exact paths when backend is ready.
 * Base URL is from env (NEXT_PUBLIC_API_URL); paths are appended.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

/** Replace these paths with exact API paths once you receive them */
export const apis = {
  // Auth / user (if any)
  // userProfile: `${BASE}/user/profile`,
  // login: `${BASE}/auth/login`,

  // Packages / pricing (existing packages API may already exist)
  packages: `${BASE}/api/v1.0/packages`,
  /** Next.js proxy route → backend getServiceById; call with baseURL: '' */
  getServiceById: '/api/service/getServiceById',
  // Add more package/service endpoints when you have paths:
  // propertyAdvertising: `${BASE}/...`,
  // gasSafety: `${BASE}/...`,
  // epc: `${BASE}/...`,
  // electricalSafety: `${BASE}/...`,
  // inventory: `${BASE}/...`,
  // professionalPhotography: `${BASE}/...`,
  // rentCollection: `${BASE}/...`,
  // managementPlus: `${BASE}/...`,
  // buildingInsurance: `${BASE}/...`,
  // rentGuaranteeInsurance: `${BASE}/...`,
  // depositScheme: `${BASE}/...`,
  // tenancyCreation: `${BASE}/...`,
  // serveNoticeSection21: `${BASE}/...`,
  // renewalReminder: `${BASE}/...`,

  // Payment (Stripe – configure later)
  // paymentCreateIntent: `${BASE}/payment/create-intent`,
  // paymentConfirm: `${BASE}/payment/confirm`,
} as const

/** Stripe – placeholder; add keys and endpoints when configuring */
export const stripe = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  // paymentIntentEndpoint: `${BASE}/payment/create-intent`,
}

export default apis
