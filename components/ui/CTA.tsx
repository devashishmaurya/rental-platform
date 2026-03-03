import Link from 'next/link'
import type { CTASection } from '@/config/content'

interface CTAProps {
  content: CTASection
  variant?: 'primary' | 'secondary'
  className?: string
}

export default function CTA({ 
  content, 
  variant = 'primary',
  className = '' 
}: CTAProps) {
  const bgColor = variant === 'primary' 
    ? 'bg-primary-600' 
    : 'bg-gray-100'
  
  const textColor = variant === 'primary'
    ? 'text-white'
    : 'text-gray-900'

  return (
    <section className={`${bgColor} ${textColor} py-16 md:py-24 overflow-hidden ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-section-title md:text-3xl font-semibold mb-4 opacity-0 animate-fade-up">
            {content.title}
          </h2>
          <p className="text-hero-lead md:text-xl mb-8 opacity-90 font-normal opacity-0 animate-fade-up [animation-delay:100ms]">
            {content.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up [animation-delay:200ms]">
            <Link
              href={content.primaryButton.href}
              className={`${
                variant === 'primary'
                  ? 'bg-white text-primary-700 hover:bg-primary-50'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              } px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg`}
            >
              {content.primaryButton.text}
            </Link>
            {content.secondaryButton && (
              <Link
                href={content.secondaryButton.href}
                className={`${
                  variant === 'primary'
                    ? 'bg-transparent border-2 border-white text-white hover:bg-white/10'
                    : 'bg-transparent border-2 border-primary-600 text-primary-700 hover:bg-primary-50'
                } px-8 py-4 rounded-lg font-semibold text-lg transition-colors`}
              >
                {content.secondaryButton.text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
