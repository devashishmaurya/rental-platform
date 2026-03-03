import Link from 'next/link'

const bullets = [
  'No Admin Fees',
  'No Dead Listings',
  'Rent & Deposit Protected',
]

const TENANT_IMAGE = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'

export default function HomeTenantsSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
            <img
              src={TENANT_IMAGE}
              alt="Tenants unpacking into new home"
              className="w-full h-full object-cover"
              width={800}
              height={600}
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
              For Tenants
            </h2>
            <h3 className="text-xl md:text-2xl font-semibold text-primary-600 mb-4">
              Find Your Next Home
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              On Rent Setu there are never any admin fees. Ever. We take down listings as soon as they are let,
              so no more ghost adverts. And we&apos;ll protect your deposit and rent money.
            </p>
            <ul className="space-y-3 mb-8">
              {bullets.map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-gray-700 font-medium mb-6">
              The safer, faster and cheaper way to rent.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/search"
                className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Search Properties
              </Link>
              <Link
                href="/about-tenants"
                className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
