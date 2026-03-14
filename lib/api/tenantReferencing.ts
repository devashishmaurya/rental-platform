/**
 * Tenant Referencing / Tenant Verification service API.
 * Uses getServiceById to drive dynamic form and pricing.
 */

export const TENANT_VERIFICATION_SERVICE_ID = '268eea08-5c47-4e23-84c9-e56334c511d3'

export interface AttributeValue {
  id: string
  price: number
  valueCode: string
  valueLabel: string
}

export interface ServiceAttribute {
  id: string
  attributeCode: string
  attributeName: string
  attributeType: string
  displayOrder: number
  required: boolean
  uiComponent: string
  values: AttributeValue[]
}

export interface ServiceByIdResponseData {
  id: string
  serviceCode: string
  serviceName: string
  serviceType: string
  attributes: ServiceAttribute[]
}

export interface GetServiceByIdResponse {
  responseMessage: {
    httpStatus: number
    message: string
    responseData: ServiceByIdResponseData
    status: number
  }
  title: string
  type: string
}

export type GetServiceByIdPayload = { id: string }

/**
 * Extract response data from getServiceById API response.
 * Use with api.post(apis.getServiceById, { id: TENANT_VERIFICATION_SERVICE_ID }).
 */
export function parseGetServiceByIdResponse(
  res: GetServiceByIdResponse
): ServiceByIdResponseData {
  const data = res?.responseMessage?.responseData
  if (data) return data
  throw new Error(res?.responseMessage?.message ?? 'Failed to load service')
}

/**
 * Get unit price for order summary from service attributes.
 * Uses first attribute that has a value with price > 0; otherwise returns fallback (e.g. 799).
 */
export function getUnitPriceFromService(
  data: ServiceByIdResponseData,
  fallbackRupees: number = 799
): number {
  for (const attr of data.attributes) {
    const withPrice = attr.values?.find((v) => v.price > 0)
    if (withPrice) return withPrice.price
  }
  return fallbackRupees
}
