'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApiClient } from '@/lib/api/useApiClient'
import { apis } from '@/lib/api/endpoints'
import {
  type ServiceAttribute,
  type ServiceByIdResponseData,
  type GetServiceByIdResponse,
  TENANT_VERIFICATION_SERVICE_ID,
  parseGetServiceByIdResponse,
  getUnitPriceFromService,
} from '@/lib/api/tenantReferencing'

const FALLBACK_UNIT_PRICE = 799

/** Attribute codes that appear once (property-level); rest repeat per applicant */
const PROPERTY_LEVEL_CODES = new Set([
  'address_line_1',
  'postcode',
  'monthly_rent',
  'tenant_count',
  'has_guarantor',
])

interface ReferenceEntry {
  id: number
  values: Record<string, string | number | boolean>
}

function sortByDisplayOrder(attributes: ServiceAttribute[]): ServiceAttribute[] {
  return [...attributes].sort((a, b) => a.displayOrder - b.displayOrder)
}

function DynamicField({
  attr,
  value,
  onChange,
  namePrefix,
}: {
  attr: ServiceAttribute
  value: string | number | boolean
  onChange: (value: string | number | boolean) => void
  namePrefix?: string
}) {
  const id = namePrefix ? `${namePrefix}-${attr.attributeCode}` : attr.attributeCode
  const label = attr.attributeName
  const required = attr.required ?? false

  if (attr.uiComponent === 'CHECKBOX' || attr.attributeType === 'BOOLEAN') {
    const checked = typeof value === 'boolean' ? value : false
    return (
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-gray-700">{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
    )
  }

  if (attr.uiComponent === 'NUMBER' || attr.attributeType === 'NUMBER') {
    const numVal = typeof value === 'number' ? value : (value === '' ? '' : Number(value))
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="number"
          id={id}
          value={numVal === '' ? '' : numVal}
          onChange={(e) => {
            const v = e.target.value
            onChange(v === '' ? '' : Number(v))
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
    )
  }

  // TEXT (default)
  const textVal = value === undefined || value === null ? '' : String(value)
  const inputType = attr.attributeCode === 'email' ? 'email' : attr.attributeCode === 'phone_number' ? 'tel' : 'text'
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={inputType}
        id={id}
        value={textVal}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>
  )
}

export function TenantReferencingContent() {
  const api = useApiClient()
  const [propertyValues, setPropertyValues] = useState<Record<string, string | number | boolean>>({})
  const [entries, setEntries] = useState<ReferenceEntry[]>([{ id: 0, values: {} }])
  const nextIdRef = useRef(1)
  const [service, setService] = useState<ServiceByIdResponseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .post<GetServiceByIdResponse>(
        apis.getServiceById,
        { id: TENANT_VERIFICATION_SERVICE_ID },
        { baseURL: '' }
      )
      .then((res) => {
        if (cancelled) return
        const data = parseGetServiceByIdResponse(res)
        setService(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load service')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [api])

  const addEntry = useCallback(() => {
    setEntries((prev) => [...prev, { id: nextIdRef.current++, values: {} }])
  }, [])

  const removeEntry = useCallback((id: number) => {
    setEntries((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((e) => e.id !== id)
    })
  }, [])

  const setPropertyValue = useCallback((attrCode: string, value: string | number | boolean) => {
    setPropertyValues((prev) => ({ ...prev, [attrCode]: value }))
  }, [])

  const setEntryValue = useCallback((entryId: number, attrCode: string, value: string | number | boolean) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, values: { ...e.values, [attrCode]: value } } : e
      )
    )
  }, [])

  const sortedAttributes = useMemo(
    () => (service ? sortByDisplayOrder(service.attributes) : []),
    [service]
  )
  const propertyAttributes = useMemo(
    () => sortedAttributes.filter((a) => PROPERTY_LEVEL_CODES.has(a.attributeCode)),
    [sortedAttributes]
  )
  const applicantAttributes = useMemo(
    () => sortedAttributes.filter((a) => !PROPERTY_LEVEL_CODES.has(a.attributeCode)),
    [sortedAttributes]
  )

  const unitPrice = useMemo(
    () => (service ? getUnitPriceFromService(service, FALLBACK_UNIT_PRICE) : FALLBACK_UNIT_PRICE),
    [service]
  )
  const serviceName = service?.serviceName ?? 'Reference'
  const { count, total } = useMemo(
    () => ({
      count: entries.length,
      total: entries.length * unitPrice,
    }),
    [entries.length, unitPrice]
  )
  const countLabel = `${count}× ${serviceName}`

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          Tenant Referencing
        </h1>
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
          <p className="text-gray-500">Loading form…</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          Tenant Referencing
        </h1>
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">
          <p className="font-medium">Could not load service</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
        Tenant Referencing
      </h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-8">
        <section className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Want to learn more about referencing?
              </h2>
              <p className="mt-3 text-sm text-gray-700">
                Referencing helps you check a tenant’s identity, income and previous
                rental history before they sign a tenancy agreement.
              </p>
            </div>
          </div>

          {propertyAttributes.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
              </div>
              <div className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
                {propertyAttributes.map((attr) => (
                  <DynamicField
                    key={attr.id}
                    attr={attr}
                    value={propertyValues[attr.attributeCode] ?? ''}
                    onChange={(value) => setPropertyValue(attr.attributeCode, value)}
                  />
                ))}
              </div>
            </div>
          )}

          {applicantAttributes.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Tenant / Guarantor Details
                </h2>
              </div>
              <div className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
                {entries.map((entry, index) => {
                  const canRemove = entries.length > 1
                  const namePrefix = `ref-${entry.id}`
                  return (
                    <div key={entry.id} className="space-y-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                      {index > 0 && (
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Applicant {index + 1}
                        </p>
                      )}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {applicantAttributes.map((attr) => (
                          <div
                            key={attr.id}
                            className={attr.uiComponent === 'CHECKBOX' ? 'flex items-end' : undefined}
                          >
                            <DynamicField
                              attr={attr}
                              value={entry.values[attr.attributeCode] ?? ''}
                              onChange={(value) => setEntryValue(entry.id, attr.attributeCode, value)}
                              namePrefix={namePrefix}
                            />
                          </div>
                        ))}
                      </div>
                      {canRemove && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
                            className="rounded-md bg-red-500 px-3 py-2 text-xs text-white hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
                <button
                  type="button"
                  onClick={addEntry}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Add additional tenant or guarantor
                </button>
              </div>
            </div>
          )}
        </section>

        <aside>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">Order Summary</h2>
            <div className="flex justify-between text-sm text-gray-700">
              <span>{countLabel}</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-md bg-emerald-600 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled
            >
              Checkout Securely
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}
