import test from 'node:test'
import assert from 'node:assert/strict'
import { indexingEnabled, publicSeoPaths, siteOrigin } from '../lib/seo.mjs'
test('SEO allowlist includes 70 lessons and excludes personal and planned pages', () => {
  const paths = publicSeoPaths()
  assert.equal(paths.filter(path => /\/fi-[a-c][0-2]-\d{2}$/.test(path)).length, 70)
  assert.equal(new Set(paths).size, paths.length)
  assert.ok(paths.every(path => !/account|student|teacher|admin|api|progress|review|opiope-/.test(path)))
})
test('indexing requires explicit HTTPS production configuration', () => {
  assert.equal(indexingEnabled({}), false)
  const live = { OPIOPE_ALLOW_INDEXING: 'true', NEXT_PUBLIC_SITE_URL: 'https://example.org' }
  assert.equal(indexingEnabled(live), true)
  assert.equal(indexingEnabled({ ...live, VERCEL_ENV: 'preview' }), false)
  assert.equal(indexingEnabled({ ...live, NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' }), false)
  assert.equal(indexingEnabled({ ...live, NEXT_PUBLIC_SITE_URL: 'https://preview.vercel.app' }), false)
})
test('canonical origin normalizes slash and rejects path or credentials', () => {
  assert.equal(siteOrigin('https://example.org/'), 'https://example.org')
  assert.throws(() => siteOrigin('https://example.org/path'))
  assert.throws(() => siteOrigin('https://secret@example.org'))
})
