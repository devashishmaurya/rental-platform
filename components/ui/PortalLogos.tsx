export default function PortalLogos() {
  const portals = ['Rightmove', 'OnTheMarket', 'RentalPlatform']

  return (
    <section className="py-12 md:py-16 bg-white border-y border-gray-200">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600 font-medium text-base md:text-lg">
          We advertise on Rightmove, OnTheMarket and many more
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mt-6">
          {portals.map((name) => (
            <span
              key={name}
              className="text-lg md:text-xl font-semibold text-gray-400"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
