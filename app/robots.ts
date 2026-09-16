import type { MetadataRoute } from 'next'
import { indexingEnabled, siteOrigin } from '@/lib/seo.mjs'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteOrigin()
  if (!indexingEnabled()) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/account/', '/student', '/teacher', '/admin', '/api/'] },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
