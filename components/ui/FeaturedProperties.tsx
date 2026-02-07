import Link from 'next/link'

const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80',
]

const featured = [
  { price: '₹15,000', beds: 1, baths: 1, title: '1 BHK Flat, Riverside', location: 'Mumbai', image: PROPERTY_IMAGES[0], letAgreed: false },
  { price: '₹28,000', beds: 2, baths: 2, title: '2 BHK Flat, Koramangala', location: 'Bangalore', image: PROPERTY_IMAGES[1], letAgreed: true },
  { price: '₹18,000', beds: 2, baths: 1, title: '2 BHK Flat, Anna Nagar', location: 'Chennai', image: PROPERTY_IMAGES[2], letAgreed: false },
  { price: '₹35,000', beds: 1, baths: 1, title: '1 BHK Flat, Bandra', location: 'Mumbai', image: PROPERTY_IMAGES[3], letAgreed: false },
  { price: '₹22,000', beds: 2, baths: 2, title: '2 BHK Flat, Indiranagar', location: 'Bangalore', image: PROPERTY_IMAGES[4], letAgreed: true },
  { price: '₹12,000', beds: 2, baths: 1, title: '2 BHK Flat, Salt Lake', location: 'Kolkata', image: PROPERTY_IMAGES[5], letAgreed: false },
]

export default function FeaturedProperties() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
          Featured Properties
        </h2>
        <p className="text-gray-600 mb-10">
          Some of our available and recently let properties
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((prop, i) => (
            <Link
              key={i}
              href="/search"
              className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={prop.image}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  width={400}
                  height={300}
                />
                {prop.letAgreed && (
                  <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    Let Agreed
                  </span>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <span className="text-white font-bold text-lg drop-shadow-md">
                    {prop.price}
                    <span className="font-normal text-sm"> / month</span>
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {prop.title}, {prop.location}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {prop.beds} bed · {prop.baths} bath
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/search"
            className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            View all properties
          </Link>
        </div>
      </div>
    </section>
  )
}
