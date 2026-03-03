'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Legacy route: /search/[id] redirects to canonical OpenRent-style URL
 * /property-to-rent/property/property/[id] so one details page is maintained.
 */
export default function SearchIdRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id != null ? String(params.id) : null

  useEffect(() => {
    if (!id) {
      router.replace('/search')
      return
    }
    router.replace(`/property-to-rent/property/property/${id}`)
  }, [id, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Redirecting to property...</p>
    </div>
  )
}
