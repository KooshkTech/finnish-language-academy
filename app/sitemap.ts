import type { MetadataRoute } from 'next'
import { indexingEnabled, publicSeoPaths, siteOrigin } from '@/lib/seo.mjs'
export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexingEnabled()) return []
  return publicSeoPaths().map(path => ({ url: siteOrigin() + (path === '/' ? '' : path) }))
}
