import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://opiope.fi'
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/account/', '/student', '/teacher', '/admin', '/api/'] },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
