import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rental-platform.com'

  const routes = [
    '',
    '/what-we-are',
    '/what-we-do',
    '/about-tenants',
    '/about-landlords',
    '/help-center',
    '/contact',
    '/privacy-policy',
    '/terms',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'daily' : 'weekly') as 'daily' | 'weekly' | 'monthly' | 'yearly',
    priority: route === '' ? 1 : 0.8,
  }))
}
