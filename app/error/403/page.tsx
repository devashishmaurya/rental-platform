'use client'

import Link from 'next/link'

/**
 * 403 Forbidden - shown when API returns 403 or route guard denies access.
 */
export default function Forbidden403Page() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="text-muted-foreground">You don’t have permission to view this page.</p>
      <Link href="/" className="text-primary underline">
        Go home
      </Link>
    </div>
  )
}
