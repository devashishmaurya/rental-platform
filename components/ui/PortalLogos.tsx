export default function PortalLogos() {
  const portals = ['Rightmove', 'OnTheMarket', 'Rent Setu']

  return (
    <section className="py-12 md:py-16 bg-white border-y border-gray-200 overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600 font-medium text-base md:text-lg opacity-0 animate-fade-up">
          We advertise on Rightmove, OnTheMarket and many more
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mt-6">
          {portals.map((name, i) => (
            <span
              key={name}
              className="text-lg md:text-xl font-semibold text-gray-400 opacity-0 animate-slide-in-right hover:text-gray-600 transition-colors"
              style={{ animationDelay: `${150 + i * 80}ms` }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
