const press = ['BBC', 'Mirror', 'The Telegraph', 'The Sun', 'Express', 'Forbes', 'Tech Crunch']

export default function PressSection() {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-10">
          In the Press
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {press.map((name) => (
            <span
              key={name}
              className="text-lg md:text-xl font-semibold text-gray-400 hover:text-gray-600 transition-colors"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
