import { Suspense } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Properties | Rental Platform',
  description: 'Search for rental properties in your area',
}

function SearchResults() {
  // This will be implemented when property search is added
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Search Properties</h1>
        <p className="text-gray-600">
          Property search functionality will be implemented in Phase 2.
        </p>
      </div>
    </div>
  )
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}
