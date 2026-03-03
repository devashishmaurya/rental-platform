import { ReactNode } from 'react'

// Prevent caching of login/callback so browser always gets fresh page (no 304 Not Modified)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
