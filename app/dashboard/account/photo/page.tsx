'use client'

import { useKeycloak } from '@/lib/auth/keycloak'

function getUserInitial(user: { name?: string; preferred_username?: string } | null): string {
  if (!user) return '?'
  const s = user.name || user.preferred_username || ''
  return (s.charAt(0) || '?').toUpperCase()
}

export default function AccountPhotoPage() {
  const { user } = useKeycloak()
  const initials = getUserInitial(user)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">My Photo</h1>
      <p className="mt-1 text-sm text-gray-600">
        Upload a profile photo. This can be shown to landlords when you make enquiries.
      </p>
      <div className="mt-6 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-semibold text-primary-700">
          {initials}
        </div>
        <div>
          <p className="text-sm text-gray-600">Photo upload will be available here.</p>
          <button
            type="button"
            disabled
            className="mt-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
          >
            Upload photo (coming soon)
          </button>
        </div>
      </div>
    </div>
  )
}
