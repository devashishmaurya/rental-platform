import Link from 'next/link'

interface ComingSoonProps {
  /** Service or page name (e.g. "Tenant Referencing") */
  title: string
  /** Optional short line below the badge */
  description?: string
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24 max-w-2xl text-center">
      <div className="inline-flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/50 px-10 py-12">
        <div className="flex items-center justify-center gap-2">
          <span className="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-white">
            Coming Soon
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-2 text-gray-600">{description}</p>
          )}
        </div>
        <p className="text-sm text-gray-500">
          We&apos;re building this. You can integrate it when ready.
        </p>
        <Link
          href="/dashboard/landlord-services"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          ← Back to Landlord Services
        </Link>
      </div>
    </div>
  )
}
