'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useKeycloak } from '@/lib/auth/keycloak'

export default function AccountEditPage() {
  const { user } = useKeycloak()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [givenName, setGivenName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setEmail((user as { email?: string }).email || '')
      setGivenName(user.given_name || (user.name || '').split(' ')[0] || '')
      setFamilyName(user.family_name || (user.name || '').split(' ').slice(1).join(' ') || '')
    }
  }, [user])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call API to update profile
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">Edit your details</h1>
      <p className="mt-1 text-sm text-gray-600">
        You can change your password, email address, name and phone number below. You can change
        your profile photo{' '}
        <Link href="/dashboard/account/photo" className="text-primary-600 hover:underline">
          here
        </Link>
        .
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          {!passwordOpen ? (
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="mt-1 text-sm text-primary-600 hover:underline"
            >
              Click to change password
            </button>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              Password changes are handled through your sign-in provider. Sign out and use &quot;Forgot
              password&quot; on the login page, or update your password in your provider account.
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <span className="inline-flex items-center rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
              Verified
            </span>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="your@email.com"
          />
        </div>

        {/* First name */}
        <div>
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">
              First / Given Name(s)
            </label>
            <span className="text-xs text-gray-500">Public</span>
          </div>
          <input
            type="text"
            value={givenName}
            onChange={(e) => setGivenName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="First name"
          />
        </div>

        {/* Last name */}
        <div>
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">Last / Family Name</label>
            <span className="text-xs text-gray-500">Private</span>
          </div>
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Last name"
          />
        </div>

        {/* Phone */}
        <div>
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Primary UK Phone Number
            </label>
            <span className="text-xs text-gray-500">Optional</span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Phone number"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Save
          </button>
          {saved && (
            <span className="text-sm text-green-600">Details saved successfully.</span>
          )}
        </div>
      </form>
    </div>
  )
}
