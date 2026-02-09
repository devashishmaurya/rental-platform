import Link from 'next/link'

const LANDLORD_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80'
const TENANT_IMAGE = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80'

const landlordBullets = [
  '100% Free Advertising Option',
  'No Hidden Fees',
  'No Renewal Fees',
  'No Credit Card to Get Started',
]

const tenantBullets = [
  'No Admin Fees',
  'No Dead Listings',
  'Rent & Deposit Protected',
]

function Card({
  title,
  subtitle,
  description,
  bullets,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  image,
  imageAlt,
}: {
  title: string
  subtitle: string
  description: string
  bullets: string[]
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
  image: string
  imageAlt: string
}) {
  return (
    <article className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover"
          width={600}
          height={375}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-xl md:text-2xl font-semibold text-white drop-shadow-md">
            {title}
          </h2>
          <p className="text-white/95 text-sm md:text-base font-medium mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="p-6 md:p-8 flex flex-col flex-grow">
        <p className="text-gray-600 leading-relaxed mb-6">
          {description}
        </p>
        <ul className="space-y-3 mb-8">
          {bullets.map((item) => (
            <li key={item} className="flex items-center gap-3 text-gray-700">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3 mt-auto">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function HomeAudienceSection() {
  return (
    <section className="py-14 md:py-20 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
              For Landlords & Tenants
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you want to list your property or find your next home, we’ve got you covered.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
            <Card
              title="For Landlords"
              subtitle="Advertise Your Rental Property"
              description="We find you tenants and help with referencing, contracts and more. You stay in control."
              bullets={landlordBullets}
              primaryHref="/about-landlords"
              primaryLabel="Start Advertising"
              secondaryHref="/what-we-do"
              secondaryLabel="Learn more"
              image={LANDLORD_IMAGE}
              imageAlt="Landlord with laptop managing property"
            />
            <Card
              title="For Tenants"
              subtitle="Find Your Next Home"
              description="No admin fees. Listings removed when let. We protect your deposit and rent money—the safer, faster way to rent."
              bullets={tenantBullets}
              primaryHref="/search"
              primaryLabel="Search Properties"
              secondaryHref="/about-tenants"
              secondaryLabel="Learn more"
              image={TENANT_IMAGE}
              imageAlt="Tenants in new home"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
