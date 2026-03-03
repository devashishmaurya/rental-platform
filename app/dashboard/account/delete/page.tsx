'use client'

import { useKeycloak } from '@/lib/auth/keycloak'

export default function AccountDeletePage() {
  const { logout } = useKeycloak()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">Delete Account</h1>
      <p className="mt-1 text-sm text-gray-600">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
        <p className="text-sm text-red-800">
          Account deletion is not yet implemented. To sign out of this device, use Log out in the
          sidebar or{' '}
          <button
            type="button"
            onClick={() => logout()}
            className="font-medium underline hover:no-underline"
          >
            click here
          </button>
          .
        </p>
      </div>
    </div>
  )
}
