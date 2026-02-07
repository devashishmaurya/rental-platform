import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rental-platform.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
      },
      {
        userAgent: '*',
        disallow: ['/dashboard/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
