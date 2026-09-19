import type { MetadataRoute } from 'next'
import { indexingEnabled, publicSeoPaths, siteOrigin } from '@/lib/seo.mjs'
export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexingEnabled()) return []
  return publicSeoPaths().map(path => ({
    url: siteOrigin() + (path === '/' ? '' : path),
    changeFrequency: path === '/' || path === '/suomen-kurssi-maahanmuuttajille' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/suomen-kurssi-maahanmuuttajille' || path === '/course/fi' ? 0.9 : path.includes('/learn/academy/') ? 0.7 : 0.8,
  }))
}
