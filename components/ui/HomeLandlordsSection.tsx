import Link from 'next/link'

const bullets = [
  '100% Free Advertising Option',
  'No Hidden Fees',
  'No Renewal Fees',
  'No Credit Card to Get Started',
]

const LANDLORD_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'

export default function HomeLandlordsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
              For Landlords
            </h2>
            <h3 className="text-xl md:text-2xl font-semibold text-primary-600 mb-4">
              Advertise Your Rental Property
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We find you tenants and help with referencing, contracts and more if you need it.
              Rent Setu gives you the best possible chance of finding your ideal tenant, and you stay in control.
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
            <div className="flex flex-wrap gap-4">
              <Link
                href="/about-landlords"
                className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Advertising
              </Link>
              <Link
                href="/what-we-do"
                className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
            <img
              src={LANDLORD_IMAGE}
              alt="Landlord with laptop managing property"
              className="w-full h-full object-cover"
              width={800}
              height={600}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
