import { finnishLessons, finnishLevelOrder } from '../data/finnish-curriculum.mjs'
export function siteOrigin(value = process.env.NEXT_PUBLIC_SITE_URL) {
  const url = new URL(value || 'https://opiope.fi')
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('NEXT_PUBLIC_SITE_URL must be an http(s) origin without credentials, path or query')
  return url.origin
}
export function indexingEnabled(env = process.env) {
  if (env.OPIOPE_ALLOW_INDEXING !== 'true' || env.VERCEL_ENV === 'preview' || env.VERCEL_ENV === 'development') return false
  const url = new URL(siteOrigin(env.NEXT_PUBLIC_SITE_URL))
  return Boolean(env.NEXT_PUBLIC_SITE_URL) && url.protocol === 'https:' && !/^(localhost|127\.|\[::1\])/.test(url.hostname) && !url.hostname.endsWith('.vercel.app')
}
export function publicSeoPaths() {
  return ['/', '/suomen-kurssi-maahanmuuttajille', '/privacy', '/cookies', '/terms', '/learn', '/learn/academy', '/practice', '/yki', '/course/fi', '/course/sv', '/course/fi/levels', '/course/sv/levels',
    ...finnishLevelOrder.flatMap(level => [`/learn/academy/fi-${level.toLowerCase()}`, `/course/fi/levels/${level.toLowerCase()}`, `/course/sv/levels/${level.toLowerCase()}`,
      ...['listening', 'reading', 'writing', 'speaking', 'understanding', 'vocabulary'].map(skill => `/course/sv/levels/${level.toLowerCase()}/${skill}`)]),
    ...finnishLessons.map(lesson => `/learn/academy/${lesson.bookId}/${lesson.id}`)]
}
