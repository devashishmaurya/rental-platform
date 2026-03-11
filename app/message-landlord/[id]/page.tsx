'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useApiClient } from '@/lib/api/useApiClient'
import { useKeycloak } from '@/lib/auth/keycloak'

const MESSAGE_MAX_LENGTH = 200

export default function MessageLandlordPage() {
  const params = useParams()
  const api = useApiClient()
  const { token } = useKeycloak()
  const propertyId = params?.id != null ? String(params.id) : ''
  const [propertySummary, setPropertySummary] = useState<{
    title?: string
    landlordName?: string
    landlordId?: string | number
    location?: string
    slug?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSendForm, setShowSendForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sendCopyToEmail, setSendCopyToEmail] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) return
    if (!propertyId || !/^\d+$/.test(propertyId)) {
      setLoading(false)
      return
    }
    const numId = parseInt(propertyId, 10)
    api
      .post<{
        responseMessage?: {
          responseData?: {
            properties?: Array<{
              id?: number
              houseNumber?: string
              town?: string
              postcode?: string
              propertyType?: string
              name?: string
              landlordId?: string | number
            }>
          }
        }
      }>('/api/listing/view', { id: numId }, { baseURL: '' })
      .then((res) => {
        const list = res?.responseMessage?.responseData?.properties
        const item = Array.isArray(list) && list.length > 0 ? list[0] : null
        if (item) {
          const title = [item.propertyType, item.houseNumber, item.town || item.postcode].filter(Boolean).join(', ')
          const location = (item.town || 'property').toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'property'
          const slug = [item.propertyType, item.houseNumber, item.town].filter(Boolean).join('-').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || propertyId
          setPropertySummary({
            title: title || 'Property',
            landlordName: item.name ?? undefined,
            landlordId: item.landlordId ?? undefined,
            location,
            slug,
          })
        }
      })
      .catch(() => setPropertySummary(null))
      .finally(() => setLoading(false))
  }, [propertyId, api, token])

  useEffect(() => {
    if (typeof window === 'undefined' || token) return
    const redirect = encodeURIComponent(`/message-landlord/${propertyId}`)
    window.location.href = `/auth/login?redirect=${redirect}`
  }, [token, propertyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const msg = message.trim()
    if (!msg) {
      setError('Please enter a message.')
      return
    }
    if (msg.length > MESSAGE_MAX_LENGTH) {
      setError(`Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`)
      return
    }
    const numPropertyId = parseInt(propertyId, 10)
    const landlordId = propertySummary?.landlordId != null ? Number(propertySummary.landlordId) : 1
    if (Number.isNaN(numPropertyId) || Number.isNaN(landlordId)) {
      setError('Invalid property or landlord.')
      return
    }
    setSubmitting(true)
    try {
      await api.post(
        '/api/alerts/sendMessage',
        {
          propertyId: numPropertyId,
          tenantId: 1,
          landlordId,
          senderRole: 'TENENT',
          subject: subject.trim() || 'Enquiry about property',
          message: msg,
        },
        { baseURL: '' }
      )
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-gray-500">Redirecting to sign in…</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!propertySummary) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-gray-600">Property not found.</p>
        <Link href="/search" className="text-primary-600 font-medium mt-2 inline-block hover:underline">
          Back to search
        </Link>
      </div>
    )
  }

  const location = propertySummary.location || 'property'
  const slug = propertySummary.slug || propertyId
  const propertyUrl = `/property-to-rent/${location}/${slug}/${propertyId}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Message Landlord / Request Viewing</h1>
      <p className="text-gray-600 text-sm mb-6">
        Property:{' '}
        <Link href={propertyUrl} className="text-primary-600 hover:underline">
          {propertySummary.title || `Property #${propertyId}`}
        </Link>
      </p>
      <p className="text-gray-600 text-sm mb-8">
        Landlord: <span className="font-medium text-gray-900">{propertySummary.landlordName || 'Landlord'}</span>
      </p>

      {success ? (
        <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-green-800">
          <p className="font-medium">Message sent</p>
          <p className="text-sm mt-1">The landlord will receive your message. You can also return to the property to see other options.</p>
          <Link href={propertyUrl} className="inline-block mt-3 text-primary-600 font-medium hover:underline">
            Back to property
          </Link>
        </div>
      ) : !showSendForm ? (
        <>
          <button
            type="button"
            disabled
            className="w-full rounded-xl bg-green-600/80 text-white font-semibold py-3.5 px-4 cursor-not-allowed opacity-90"
          >
            Verify Number &amp; Request Viewing
          </button>
          <div className="mt-6 rounded-xl bg-green-50 border border-green-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">What are the benefits of verifying my account?</h2>
            <ul className="space-y-2 text-sm text-gray-700 list-none">
              <li className="flex items-start gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                It will show the landlord you are serious about renting this property
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                We can show you the landlord&apos;s availability
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                We will immediately notify the landlord via SMS of your request
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                Viewing requests have a much higher response rate
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                The landlord will require you to do this if you do want to book a viewing later
              </li>
            </ul>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowSendForm(true)}
              className="text-primary-600 font-medium hover:underline"
            >
              Click here to send a message without requesting a viewing.
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-gray-700 mb-6">
            The landlord will require you to verify your number if you do want to book a viewing later.
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Send Message</h2>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Enquiry about viewing"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-gray-500 font-normal">(max {MESSAGE_MAX_LENGTH} characters)</span>
              </label>
              <textarea
                id="message"
                rows={5}
                maxLength={MESSAGE_MAX_LENGTH}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message to the landlord..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
              />
              <p className="text-xs text-gray-500 mt-1">{message.length} / {MESSAGE_MAX_LENGTH}</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={sendCopyToEmail}
                onChange={(e) => setSendCopyToEmail(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Send a copy to my email along with advice for communicating with landlords
            </label>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-red-800 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary-600 text-white font-semibold py-3.5 hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4">
            Please note: All personal details will be removed from messages using this form. To pass on your personal details, verify your phone number before contacting this landlord.
          </p>
        </>
      )}

      <p className="text-gray-500 text-sm mt-8">
        Property reference: <span className="font-medium text-gray-700">{propertyId}</span>
      </p>
    </div>
  )
}
