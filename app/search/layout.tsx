import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Properties | Rent Setu',
  description: 'Search for rental properties in your area',
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
