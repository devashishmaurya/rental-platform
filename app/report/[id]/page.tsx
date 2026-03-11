'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/api/useApiClient'

interface ReasonOption {
  id: string
  name: string
}

/** Parse API response for reasons/sub-reasons (reasonName, subReasonName, or name) */
function parseReasons(data: unknown): ReasonOption[] {
  if (Array.isArray(data)) {
    return data
      .map((x) => {
        if (typeof x !== 'object' || !x || !('id' in x)) return null
        const obj = x as { id?: unknown; reasonName?: unknown; subReasonName?: unknown; name?: unknown }
        const id = obj.id != null ? String(obj.id) : ''
        const name =
          obj.reasonName != null ? String(obj.reasonName)
          : obj.subReasonName != null ? String(obj.subReasonName)
          : obj.name != null ? String(obj.name)
          : ''
        return id ? { id, name } : null
      })
      .filter((r): r is ReasonOption => r != null && r.name !== '')
  }
  if (data && typeof data === 'object' && 'responseMessage' in data) {
    const msg = (data as { responseMessage?: { responseData?: unknown } }).responseMessage
    return parseReasons(msg?.responseData ?? [])
  }
  if (data && typeof data === 'object' && 'responseData' in data) {
    return parseReasons((data as { responseData?: unknown }).responseData ?? [])
  }
  return []
}

export default function ReportPropertyPage() {
  const params = useParams()
  const router = useRouter()
  const api = useApiClient()
  const propertyId = params?.id != null ? String(params.id) : ''
  const [reasons, setReasons] = useState<ReasonOption[]>([])
  const [subReasons, setSubReasons] = useState<ReasonOption[]>([])
  const [loadingReasons, setLoadingReasons] = useState(true)
  const [loadingSubReasons, setLoadingSubReasons] = useState(false)
  const [selectedReasonId, setSelectedReasonId] = useState<string>('')
  const [selectedSubReasonId, setSelectedSubReasonId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [additionalDetailsOpen, setAdditionalDetailsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [propertySummary, setPropertySummary] = useState<{ title?: string; imageUrl?: string; landlordName?: string; landlordId?: string } | null>(null)

  // Load property summary (for display and landlordId)
  useEffect(() => {
    if (!propertyId || !/^\d+$/.test(propertyId)) return
    const numId = parseInt(propertyId, 10)
    api.post<{ responseMessage?: { responseData?: { properties?: Array<{ id?: number; houseNumber?: string; town?: string; postcode?: string; propertyType?: string; imageUrl?: string; name?: string; landlordId?: string }> } } }>(
      '/api/listing/view',
      { id: numId },
      { baseURL: '' }
    ).then((res) => {
      const list = res?.responseMessage?.responseData?.properties
      const item = Array.isArray(list) && list.length > 0 ? list[0] : null
      if (item) {
        const title = [item.propertyType, item.houseNumber, item.town || item.postcode].filter(Boolean).join(', ')
        setPropertySummary({
          title: title || 'Property',
          imageUrl: item.imageUrl ?? undefined,
          landlordName: item.name ?? undefined,
          landlordId: item.landlordId != null ? String(item.landlordId) : undefined,
        })
      }
    }).catch(() => { /* ignore */ })
  }, [propertyId, api])

  // Load master reasons
  useEffect(() => {
    setLoadingReasons(true)
    fetch('/api/listing/getReportReasons')
      .then((res) => res.json())
      .then((data) => {
        setReasons(parseReasons(data))
      })
      .catch(() => setReasons([]))
      .finally(() => setLoadingReasons(false))
  }, [])

  // Load sub-reasons when reason selected
  useEffect(() => {
    if (!selectedReasonId) {
      setSubReasons([])
      setSelectedSubReasonId('')
      return
    }
    setLoadingSubReasons(true)
    fetch('/api/listing/getSubReasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedReasonId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSubReasons(parseReasons(data))
        setSelectedSubReasonId('')
      })
      .catch(() => setSubReasons([]))
      .finally(() => setLoadingSubReasons(false))
  }, [selectedReasonId])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!selectedReasonId) {
      setError('Please select a reason for reporting.')
      return
    }
    if (subReasons.length > 0 && !selectedSubReasonId) {
      setError('Please select a specific reason (sub-category) for your report.')
      return
    }
    setSubmitting(true)
    try {
      let attachmentPaths: string[] = []
      if (attachmentFiles.length > 0) {
        const formData = new FormData()
        attachmentFiles.forEach((file, i) => formData.append(`file`, file))
        const uploadRes = await fetch('/api/listing/uploadReportAttachment', { method: 'POST', body: formData })
        if (uploadRes.ok) {
          const data = await uploadRes.json()
          const paths = data?.paths ?? data?.responseMessage?.responseData ?? []
          attachmentPaths = Array.isArray(paths) ? paths : [paths]
        }
      }
      await api.post('/api/listing/submitPropertyReport', {
        propertyId,
        landlordId: propertySummary?.landlordId ?? '1',
        reportedByUserId: '2',
        reasonId: selectedReasonId,
        subReasonId: selectedSubReasonId || undefined,
        description: description.trim() || undefined,
        attachments: attachmentPaths,
      }, { baseURL: '' })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report.')
    } finally {
      setSubmitting(false)
    }
  }, [api, propertyId, propertySummary?.landlordId, selectedReasonId, selectedSubReasonId, description, attachmentFiles])

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report submitted</h1>
          <p className="text-gray-600 mb-8">
            We take all reports seriously and will investigate where appropriate.
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-block rounded-xl bg-primary-600 text-white font-semibold px-6 py-3 hover:bg-primary-700"
          >
            Back to property
          </button>
          <Link
            href="/search"
            className="ml-3 inline-block rounded-xl border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 hover:bg-gray-50"
          >
            Search properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to property
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Report advert</h1>
        <p className="text-gray-600 mb-8">
          Help us keep listings accurate. Your report will be reviewed by our team.
        </p>

        {propertySummary && (
          <div className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl mb-8">
            {propertySummary.imageUrl && (
              <img
                src={propertySummary.imageUrl}
                alt=""
                className="w-24 h-20 object-cover rounded-lg"
              />
            )}
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{propertySummary.title}</p>
              {propertySummary.landlordName && (
                <p className="text-sm text-gray-500 mt-0.5">Landlord: {propertySummary.landlordName}</p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Why are you reporting this property advert?
            </label>
            {loadingReasons ? (
              <p className="text-gray-500">Loading reasons…</p>
            ) : (
              <ul className="space-y-2">
                {reasons.map((r) => (
                  <li key={r.id}>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <input
                        type="radio"
                        name="reason"
                        value={r.id}
                        checked={selectedReasonId === r.id}
                        onChange={() => setSelectedReasonId(r.id)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-gray-900">{r.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedReasonId && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Please specify (optional)
              </label>
              {loadingSubReasons ? (
                <p className="text-gray-500">Loading options…</p>
              ) : (
                <ul className="space-y-2">
                  {subReasons.map((s) => (
                    <li key={s.id}>
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                        <input
                          type="radio"
                          name="subReason"
                          value={s.id}
                          checked={selectedSubReasonId === s.id}
                          onChange={() => setSelectedSubReasonId(s.id)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-gray-900">{s.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => setAdditionalDetailsOpen((o) => !o)}
              className="text-primary-600 font-medium text-sm hover:underline"
            >
              {additionalDetailsOpen ? 'Hide' : 'Additional Details +'}
            </button>
            {additionalDetailsOpen && (
              <div className="mt-3 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragOver(false)
                      const files = Array.from(e.dataTransfer.files)
                      setAttachmentFiles((prev) => [...prev, ...files])
                    }}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                      dragOver ? 'border-primary-500 bg-primary-50/50' : 'border-gray-300 bg-gray-50/50'
                    }`}
                  >
                    <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-2">Drag & drop a file here</p>
                    <p className="text-xs text-gray-500 mb-3">Or</p>
                    <label className="inline-block rounded-lg bg-primary-600 text-white text-sm font-medium px-4 py-2 cursor-pointer hover:bg-primary-700">
                      Browse files
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={(e) => {
                          const files = e.target.files ? Array.from(e.target.files) : []
                          setAttachmentFiles((prev) => [...prev, ...files])
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>
                  {attachmentFiles.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {attachmentFiles.map((file, i) => (
                        <li key={`${file.name}-${i}`} className="flex items-center justify-between text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2">
                          <span className="truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setAttachmentFiles((prev) => prev.filter((_, j) => j !== i))}
                            className="text-red-600 hover:text-red-700 ml-2 shrink-0"
                            aria-label="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional comments</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any extra details that might help us investigate..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              submitting ||
              !selectedReasonId ||
              (subReasons.length > 0 && !selectedSubReasonId)
            }
            className="w-full rounded-xl bg-primary-600 text-white font-semibold py-3.5 hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit report'}
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-6">
          We take all reports seriously and investigate any concerns directly with the landlord where appropriate.
        </p>
      </div>
    </div>
  )
}
