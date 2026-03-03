'use client'

import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome to your management dashboard. As you use Rent Setu&apos;s services your dashboard
          will serve relevant content here. You can also use the links on the left to navigate more
          areas of the site.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Search Listings card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Search Listings</h2>
          </div>
          <p className="text-gray-600 text-sm flex-1">
            Join the Rent Setu platform today! Just click below to begin the search for your next
            home.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Search listings
          </Link>
          <p className="mt-3 text-xs text-gray-500">
            When you&apos;ve found one you like, just book a viewing with the landlord directly —{' '}
            <Link href="/help-center" className="text-primary-600 hover:underline">
              click here to find out how
            </Link>
            .
          </p>
        </div>

        {/* Ready to list a property card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent-green/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-accent-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Ready to list a property?</h2>
          </div>
          <p className="text-gray-600 text-sm flex-1">
            Create a new listing to start finding tenants today.
          </p>
          <Link
            href="/landlords/add-listing"
            className="mt-4 inline-flex justify-center rounded-lg bg-accent-green px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-green-hover transition-colors"
          >
            Create a new listing
          </Link>
        </div>
      </div>

      {/* Need more information or help */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Need more information or help?
        </h3>
        <div className="flex flex-wrap gap-6">
          <Link
            href="/help-center"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Visit Our Help Centre
          </Link>
          <Link
            href="/what-we-are"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Ask The Community!
          </Link>
          <Link
            href="/what-we-are"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Read Our Blog
          </Link>
        </div>
      </div>
    </div>
  )
}
