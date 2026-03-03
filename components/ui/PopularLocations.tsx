import Link from 'next/link'

const locations = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal',
]

export default function PopularLocations() {
  return (
    <section className="py-16 md:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-10 opacity-0 animate-fade-up">
          Popular Locations
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {locations.map((city, i) => (
            <Link
              key={city}
              href={`/search?q=${encodeURIComponent(city)}`}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 font-medium transition-all duration-300 hover:scale-105 opacity-0 animate-scale-in"
              style={{ animationDelay: `${80 + (i % 8) * 40}ms` }}
            >
              {city}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
