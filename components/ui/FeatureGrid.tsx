import type { Feature } from '@/config/content'

interface FeatureGridProps {
  features: Feature[]
  columns?: 2 | 3 | 4
  className?: string
}

export default function FeatureGrid({ 
  features, 
  columns = 3,
  className = '' 
}: FeatureGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }

  return (
    <section className={`py-16 md:py-24 bg-white ${className}`}>
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-8 md:gap-12`}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
            >
              {feature.icon && (
                <div className="text-5xl mb-4">{feature.icon}</div>
              )}
              {feature.image && (
                <div className="mb-4">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed font-normal">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
