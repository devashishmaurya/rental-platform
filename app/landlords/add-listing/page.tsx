'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useApiClient } from '@/lib/api/useApiClient'

/** Request body for POST /api/listing/add (proxy → backend /api/listing/v1.0/add) */
interface AddListingBody {
  landlordId: number
  postcode: string
  houseNumber: string
  addressLine2: string
  addressLine3: string
  town: string
  advertType: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  maxTenants: number
  furnishing: string
  epcRating: string
  description: string
  monthlyRent: number
  depositAmount: number
  minTenancyMonths: number
  maxTenancyMonths: number
  earliestMoveIn: string
  billsIncluded: boolean
  remoteVideoViewing: boolean
  termsAccepted: boolean
  features: {
    garden: boolean
    parking: boolean
    fireplace: boolean
    liveInLandlord: boolean
  }
  tenantPreferences: {
    studentsAllowed: boolean
    familiesAllowed: boolean
    dssIncomeAccepted: boolean
    petsAllowed: boolean
    smokersAllowed: boolean
    studentsOnly: boolean
    additionalNotes: string
  }
}

const PROPERTY_TYPES = [
  { value: 'FLAT', label: 'Flat / Apartment' },
  { value: 'HOUSE', label: 'Independent House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'PG', label: 'PG / Co-living' },
]

const FURNISHING_OPTIONS = [
  { value: 'FURNISHED', label: 'Fully Furnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
  { value: 'UNFURNISHED', label: 'Unfurnished' },
]

const EPC_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const defaultForm: AddListingBody = {
  landlordId: 1,
  postcode: '',
  houseNumber: '',
  addressLine2: '',
  addressLine3: '',
  town: '',
  advertType: 'RENT',
  propertyType: 'FLAT',
  bedrooms: 1,
  bathrooms: 1,
  maxTenants: 2,
  furnishing: 'SEMI_FURNISHED',
  epcRating: 'C',
  description: '',
  monthlyRent: 0,
  depositAmount: 0,
  minTenancyMonths: 6,
  maxTenancyMonths: 12,
  earliestMoveIn: '',
  billsIncluded: false,
  remoteVideoViewing: false,
  termsAccepted: false,
  features: {
    garden: false,
    parking: false,
    fireplace: false,
    liveInLandlord: false,
  },
  tenantPreferences: {
    studentsAllowed: true,
    familiesAllowed: true,
    dssIncomeAccepted: false,
    petsAllowed: false,
    smokersAllowed: false,
    studentsOnly: false,
    additionalNotes: '',
  },
}

const STEPS = [
  { id: 1, title: 'Address', short: 'Address' },
  { id: 2, title: 'Property details', short: 'Details' },
  { id: 3, title: 'Rent & tenancy', short: 'Rent' },
  { id: 4, title: 'Description & options', short: 'More' },
  { id: 5, title: 'Review & submit', short: 'Submit' },
]

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-accent-green focus:ring-2 focus:ring-accent-green/20 focus:outline-none transition-all duration-200 hover:border-gray-300'
const labelClass = 'block text-sm font-semibold text-gray-800 mb-2'
const labelHintClass = 'block text-xs text-gray-500 mt-1'
const sectionCardClass =
  'bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50 overflow-hidden transition-shadow duration-300 hover:shadow-md scroll-mt-44'

function SectionHeader({
  step,
  title,
  subtitle,
  icon,
}: {
  step: number
  title: string
  subtitle?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-base font-bold text-white shadow-sm">
          {step}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {icon && <div className="ml-auto text-gray-300">{icon}</div>}
      </div>
    </div>
  )
}

function ToggleCard({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`text-left w-full rounded-xl border-2 p-4 transition-all duration-200 ${
        checked
          ? 'border-accent-green bg-accent-green/5 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="font-semibold text-gray-900">{label}</span>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
        <span
          className={`relative flex h-6 w-11 shrink-0 rounded-full transition-colors ${
            checked ? 'bg-accent-green' : 'bg-gray-200'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
              checked ? 'left-6' : 'left-0.5'
            }`}
          />
        </span>
      </div>
    </button>
  )
}

export default function AddListingPage() {
  const api = useApiClient()
  const [form, setForm] = useState<AddListingBody>(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(1)

  const scrollToStep = (stepId: number) => {
    setActiveStep(stepId)
    const el = document.getElementById(`step-${stepId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const headerOffset = 140
    const updateActiveStep = () => {
      let next = 1
      for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`step-${i}`)
        if (el) {
          const top = el.getBoundingClientRect().top
          if (top <= headerOffset + 10) next = i
        }
      }
      setActiveStep((prev) => (next !== prev ? next : prev))
    }
    window.addEventListener('scroll', updateActiveStep, { passive: true })
    updateActiveStep()
    return () => window.removeEventListener('scroll', updateActiveStep)
  }, [])

  const update = <K extends keyof AddListingBody>(key: K, value: AddListingBody[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  const updateFeatures = (key: keyof AddListingBody['features'], value: boolean) => {
    setForm((prev) => ({
      ...prev,
      features: { ...prev.features, [key]: value },
    }))
  }

  const updateTenantPrefs = (
    key: keyof AddListingBody['tenantPreferences'],
    value: boolean | string
  ) => {
    setForm((prev) => ({
      ...prev,
      tenantPreferences: { ...prev.tenantPreferences, [key]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.termsAccepted) {
      setError('Please accept the terms and conditions to continue.')
      return
    }
    if (!form.description?.trim()) {
      setError('Please add a property description.')
      return
    }
    if (form.monthlyRent <= 0 || form.depositAmount < 0) {
      setError('Please enter valid rent and deposit amounts.')
      return
    }
    if (!form.earliestMoveIn) {
      setError('Please select the earliest move-in date.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/api/listing/add', form, { baseURL: '' })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit listing. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-primary-50/50 via-white to-gray-50">
        <div className="max-w-lg w-full text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-accent-green/20 shadow-inner">
            <svg
              className="h-12 w-12 text-accent-green"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Listing submitted</h1>
          <p className="text-gray-600 text-lg mb-10 max-w-sm mx-auto">
            Your property listing has been submitted. We&apos;ll review it and make it live shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing/property-advertising"
              className="inline-flex items-center justify-center rounded-xl bg-accent-green px-6 py-4 font-semibold text-white shadow-lg hover:bg-accent-green-hover hover:shadow-xl transition-all"
            >
              Back to Property Advertising
            </Link>
            <Link
              href="/landlords/add-listing"
              className="inline-flex items-center justify-center rounded-xl border-2 border-gray-200 px-6 py-4 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Add another property
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50/95 to-gray-100">
      {/* Premium header */}
      <div className="border-b border-gray-200/80 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Add a property
              </h1>
              <p className="text-gray-500 mt-1.5 text-sm max-w-xl">
                Fill in the details below. You can edit your listing anytime after publishing.
              </p>
            </div>
            <Link
              href="/pricing/property-advertising"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-lg px-3 py-2 -m-2 hover:bg-gray-100"
            >
              <span aria-hidden>←</span> Back to pricing
            </Link>
          </div>
          {/* Step progress — click to scroll; only active step highlighted (py-2 prevents focus ring from being clipped) */}
          <div className="mt-6 flex items-center gap-0 overflow-x-auto py-2">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => scrollToStep(s.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    activeStep === s.id
                      ? 'bg-accent-green text-white hover:bg-accent-green-hover'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.id}. {s.short}
                </button>
                {idx < STEPS.length - 1 && (
                  <div className="mx-1 w-4 h-0.5 bg-gray-200 rounded shrink-0" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <form id="add-listing-form" onSubmit={handleSubmit} className="container mx-auto px-4 py-8 pb-24 max-w-3xl">
        <div className="space-y-8">
          {/* 1. Address */}
          <section id="step-1" className={sectionCardClass}>
            <SectionHeader
              step={1}
              title="Property address"
              subtitle="Where is the property located?"
            />
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>House / Flat number *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="e.g. Flat 301, B-204"
                    value={form.houseNumber}
                    onChange={(e) => update('houseNumber', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Street / Locality</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. MG Road, Koramangala"
                    value={form.addressLine2}
                    onChange={(e) => update('addressLine2', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Area</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. Indiranagar"
                    value={form.addressLine3}
                    onChange={(e) => update('addressLine3', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>City *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="e.g. Bengaluru"
                    value={form.town}
                    onChange={(e) => update('town', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    className={inputClass}
                    placeholder="e.g. 560038"
                    value={form.postcode}
                    onChange={(e) =>
                      update('postcode', e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                  />
                  <span className={labelHintClass}>6 digits</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Property details */}
          <section id="step-2" className={sectionCardClass}>
            <SectionHeader
              step={2}
              title="Property details"
              subtitle="Type, furnishing and capacity"
            />
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Property type *</label>
                  <select
                    required
                    className={inputClass}
                    value={form.propertyType}
                    onChange={(e) => update('propertyType', e.target.value)}
                  >
                    {PROPERTY_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Furnishing *</label>
                  <select
                    className={inputClass}
                    value={form.furnishing}
                    onChange={(e) => update('furnishing', e.target.value)}
                  >
                    {FURNISHING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Bedrooms *</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    className={inputClass}
                    value={form.bedrooms}
                    onChange={(e) => update('bedrooms', parseInt(e.target.value, 10) || 1)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Bathrooms *</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    className={inputClass}
                    value={form.bathrooms}
                    onChange={(e) => update('bathrooms', parseInt(e.target.value, 10) || 1)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Max tenants</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className={inputClass}
                    value={form.maxTenants}
                    onChange={(e) => update('maxTenants', parseInt(e.target.value, 10) || 1)}
                  />
                </div>
                <div>
                  <label className={labelClass}>EPC rating (optional)</label>
                  <select
                    className={inputClass}
                    value={form.epcRating}
                    onChange={(e) => update('epcRating', e.target.value)}
                  >
                    {EPC_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Rent & tenancy */}
          <section id="step-3" className={sectionCardClass}>
            <SectionHeader
              step={3}
              title="Rent & tenancy"
              subtitle="Monthly rent, deposit and availability"
            />
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Monthly rent (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    required
                    className={inputClass}
                    placeholder="e.g. 25000"
                    value={form.monthlyRent || ''}
                    onChange={(e) => update('monthlyRent', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Security deposit (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    className={inputClass}
                    placeholder="e.g. 25000"
                    value={form.depositAmount || ''}
                    onChange={(e) => update('depositAmount', parseFloat(e.target.value) || 0)}
                  />
                  <span className={labelHintClass}>Usually 1–3 months&apos; rent</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Min tenancy (months)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    className={inputClass}
                    value={form.minTenancyMonths}
                    onChange={(e) =>
                      update('minTenancyMonths', parseInt(e.target.value, 10) || 6)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Max tenancy (months)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    className={inputClass}
                    value={form.maxTenancyMonths}
                    onChange={(e) =>
                      update('maxTenancyMonths', parseInt(e.target.value, 10) || 12)
                    }
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Earliest move-in date *</label>
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={form.earliestMoveIn}
                  onChange={(e) => update('earliestMoveIn', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* 4. Description & options */}
          <section id="step-4" className={sectionCardClass}>
            <SectionHeader
              step={4}
              title="Description & options"
              subtitle="Describe your property and add features"
            />
            <div className="p-6 space-y-5">
              <div>
                <label className={labelClass}>Description *</label>
                <textarea
                  required
                  rows={5}
                  className={inputClass + ' resize-y min-h-[120px]'}
                  placeholder="Describe your property, nearby amenities, and what makes it a great place to live..."
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ToggleCard
                  checked={form.billsIncluded}
                  onChange={(v) => update('billsIncluded', v)}
                  label="Bills included in rent"
                  description="Utilities covered in monthly rent"
                />
                <ToggleCard
                  checked={form.remoteVideoViewing}
                  onChange={(v) => update('remoteVideoViewing', v)}
                  label="Remote video viewing"
                  description="Virtual viewings available"
                />
              </div>
              <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-4">
                <span className={labelClass}>Features</span>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-3">
                  {(
                    [
                      ['garden', 'Garden'] as const,
                      ['parking', 'Parking'] as const,
                      ['fireplace', 'Fireplace'] as const,
                      ['liveInLandlord', 'Live-in landlord'] as const,
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-accent-green focus:ring-accent-green"
                        checked={form.features[key]}
                        onChange={(e) => updateFeatures(key, e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-4">
                <span className={labelClass}>Tenant preferences</span>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-3">
                  {(
                    [
                      ['studentsAllowed', 'Students allowed'] as const,
                      ['familiesAllowed', 'Families allowed'] as const,
                      ['dssIncomeAccepted', 'DSS / income support'] as const,
                      ['petsAllowed', 'Pets allowed'] as const,
                      ['smokersAllowed', 'Smokers allowed'] as const,
                      ['studentsOnly', 'Students only'] as const,
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-accent-green focus:ring-accent-green"
                        checked={form.tenantPreferences[key] as boolean}
                        onChange={(e) => updateTenantPrefs(key, e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <label className={labelClass}>Additional notes for tenants</label>
                  <textarea
                    rows={2}
                    className={inputClass}
                    placeholder="e.g. Professionals preferred..."
                    value={form.tenantPreferences.additionalNotes}
                    onChange={(e) => updateTenantPrefs('additionalNotes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 5. Terms & Submit */}
          <section id="step-5" className={sectionCardClass}>
            <SectionHeader
              step={5}
              title="Review & submit"
              subtitle="Confirm and publish your listing"
            />
            <div className="p-6">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-accent-green focus:ring-accent-green"
                  checked={form.termsAccepted}
                  onChange={(e) => update('termsAccepted', e.target.checked)}
                />
                <span className="text-sm text-gray-600">
                  I accept the{' '}
                  <Link href="/terms" className="text-accent-green hover:underline font-medium">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy-policy" className="text-accent-green hover:underline font-medium">
                    Privacy Policy
                  </Link>{' '}
                  and confirm that the details provided are correct.
                </span>
              </label>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse sm:flex-row gap-4">
                <Link
                  href="/pricing/property-advertising"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-gray-200 px-6 py-3.5 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-xl bg-accent-green px-6 py-3.5 font-semibold text-white shadow-lg hover:bg-accent-green-hover disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-xl"
                >
                  {submitting ? 'Submitting…' : 'Review & Submit'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </form>

      {/* Sticky bottom CTA — premium UX */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur-sm py-4 hidden md:block">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">Ready to publish your listing?</p>
            <div className="flex gap-3">
              <Link
                href="/pricing/property-advertising"
                className="rounded-xl border-2 border-gray-200 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 text-sm transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                form="add-listing-form"
                disabled={submitting}
                className="rounded-xl bg-accent-green px-6 py-2.5 font-semibold text-white text-sm shadow-md hover:bg-accent-green-hover disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Submitting…' : 'Review & Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
