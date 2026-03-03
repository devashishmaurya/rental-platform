import Link from 'next/link'

interface ServicePageTemplateProps {
  title: string
  description: string
  features?: string[]
  priceNote?: string
  ctaText?: string
  ctaHref?: string
  children?: React.ReactNode
}

export default function ServicePageTemplate({
  title,
  description,
  features = [],
  priceNote = 'Pricing and payment (Stripe) will be configured later.',
  ctaText = 'Get started',
  ctaHref = '/landlords/add-listing',
  children,
}: ServicePageTemplateProps) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{description}</p>
      {features.length > 0 && (
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-8">
          {features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      )}
      {children}
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">{priceNote}</p>
      <Link
        href={ctaHref}
        className="inline-block mt-6 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        {ctaText}
      </Link>
    </div>
  )
}
