export default function PortalLogos() {
  const portals = ['Rightmove', 'OnTheMarket', 'RentalPlatform']

  return (
    <section className="py-12 md:py-16 bg-white border-y border-gray-200">
      <div className="container mx-auto px-4">
        <p className="text-center text-gray-600 font-medium mb-8">
          We advertise on Rightmove, OnTheMarket and many more
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {portals.map((name) => (
            <span
              key={name}
              className="text-xl md:text-2xl font-semibold text-gray-400 hover:text-gray-600 transition-colors"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
