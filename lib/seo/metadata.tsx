import { Metadata } from 'next'
import type { SEOConfig } from '@/config/content'

const defaultSEO: SEOConfig = {
  title: 'Rent Setu | Renting the way it should be',
  description: 'Find your perfect rental property or advertise your property. No admin fees, transparent pricing.',
  keywords: ['rental', 'property', 'tenants', 'landlords'],
  ogType: 'website',
  twitterCard: 'summary_large_image',
}

export function generateMetadata(seoConfig: SEOConfig): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rental-platform.com'
  
  return {
    title: seoConfig.title || defaultSEO.title,
    description: seoConfig.description || defaultSEO.description,
    keywords: seoConfig.keywords || defaultSEO.keywords,
    authors: [{ name: 'Rent Setu' }],
    creator: 'Rent Setu',
    publisher: 'Rent Setu',
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: seoConfig.ogType || 'website',
      locale: 'en_GB',
      url: seoConfig.canonicalUrl || siteUrl,
      siteName: 'Rent Setu',
      title: seoConfig.ogTitle || seoConfig.title || defaultSEO.title,
      description: seoConfig.ogDescription || seoConfig.description || defaultSEO.description,
      images: seoConfig.ogImage
        ? [
            {
              url: seoConfig.ogImage,
              width: 1200,
              height: 630,
              alt: seoConfig.ogTitle || seoConfig.title || 'Rent Setu',
            },
          ]
        : [
            {
              url: `${siteUrl}/og-image.jpg`,
              width: 1200,
              height: 630,
              alt: 'Rent Setu',
            },
          ],
    },
    twitter: {
      card: seoConfig.twitterCard || 'summary_large_image',
      title: seoConfig.ogTitle || seoConfig.title || defaultSEO.title,
      description: seoConfig.ogDescription || seoConfig.description || defaultSEO.description,
      images: seoConfig.ogImage ? [seoConfig.ogImage] : [`${siteUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: seoConfig.canonicalUrl || siteUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export function generateStructuredData(type: 'Organization' | 'WebSite' | 'BreadcrumbList' = 'WebSite') {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rental-platform.com'

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  if (type === 'Organization') {
    return {
      ...structuredData,
      name: 'Rent Setu',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      sameAs: [
        // Add social media links here
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'support@rental-platform.com',
      },
    }
  }

  if (type === 'WebSite') {
    return {
      ...structuredData,
      name: 'Rent Setu',
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }
  }

  return structuredData
}
