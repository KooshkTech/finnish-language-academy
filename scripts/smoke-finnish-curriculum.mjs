import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { fileURLToPath } from 'node:url'
import { finnishLessons, finnishLevelBooks } from '../data/finnish-curriculum.mjs'
import { publicSeoPaths } from '../lib/seo.mjs'

const probe = createServer()
probe.listen(0, '127.0.0.1')
await once(probe, 'listening')
const port = probe.address().port
await new Promise(resolve => probe.close(resolve))
const cwd = fileURLToPath(new URL('../', import.meta.url))
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
server.stdout.on('data', chunk => { output += chunk })
server.stderr.on('data', chunk => { output += chunk })
const base = `http://127.0.0.1:${port}`
const request = path => fetch(`${base}${path}`, { signal: AbortSignal.timeout(10000) })
try {
  const deadline = Date.now() + 20000
  let ready = false
  while (Date.now() < deadline && server.exitCode === null) {
    try { ready = (await request('/learn/academy')).ok; if (ready) break } catch { /* startup */ }
    await new Promise(resolve => setTimeout(resolve, 150))
  }
  assert.ok(ready, `Production server did not become ready: ${output}`)
  let checked = 0
  for (const lesson of finnishLessons) {
    const path = `/learn/academy/${lesson.bookId}/${lesson.id}`
    const response = await request(path)
    assert.equal(response.status, 200, path)
    const html = await response.text()
    assert.ok(html.includes(lesson.title), `${path}: correct lesson rendered`)
    assert.ok(html.includes(`rel="canonical" href="${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://opiope.fi'}${path}"`), `${path}: self-referencing canonical`)
    assert.ok(html.includes('Selaimen koneääni'), `${path}: truthful audio label`)
    checked++
  }
  for (const book of finnishLevelBooks) for (const path of [`/learn/academy/${book.id}`, `/course/fi/levels/${book.levelRange.toLowerCase()}`]) {
    const response = await request(path)
    assert.equal(response.status, 200, path)
    const html = await response.text()
    for (const lessonId of book.publishedLessonIds) assert.ok(html.includes(`href="/learn/academy/${book.id}/${lessonId}"`), `${path}: linked lesson ${lessonId}`)
    checked++
  }
  for (const path of ['/', '/learn', '/learn/academy', '/gateway', '/practice', '/placement-test', '/progress', '/tutor', '/yki', '/review/academy', '/learn/academy/opiope-1/op1-l02', '/course/sv/levels/a1']) {
    const response = await request(path)
    assert.equal(response.status, 200, path)
    if (path === '/') assert.ok((await response.text()).includes('Mitä haluat opiskella?'))
    if (path === '/learn') assert.ok((await response.text()).includes('10 suomen oppituntia'))
    checked++
  }
  assert.equal((await request('/learn/academy/fi-a1/fi-a0-01')).status, 404, 'Reject mismatched book and lesson')
  assert.equal((await request('/learn/academy/fi-a0/no-such-lesson')).status, 404)
  const sitemap = await (await request('/sitemap.xml')).text()
  if (process.env.OPIOPE_ALLOW_INDEXING !== 'true') {
    assert.ok(!sitemap.includes('<loc>'), 'Default test sitemap must be empty')
    assert.ok((await request('/')).headers.get('x-robots-tag')?.includes('noindex'), 'Test deployment is noindex')
  } else {
    assert.equal((sitemap.match(/<loc>/g) || []).length, publicSeoPaths().length, 'Public sitemap contains allowlisted pages')
    for (const lesson of finnishLessons) assert.ok(sitemap.includes(`/learn/academy/${lesson.bookId}/${lesson.id}`))
    assert.ok(!sitemap.includes('/progress'), 'Personal pages excluded')
    assert.ok(!(await request('/')).headers.get('x-robots-tag')?.includes('noindex'), 'Public home is indexable')
  }
  assert.ok((await request('/progress')).headers.get('x-robots-tag')?.includes('noindex'), 'Personal route is always noindex')
  for (const path of publicSeoPaths()) {
    const response = await request(path)
    assert.equal(response.status, 200, `Sitemap route: ${path}`)
    const html = await response.text()
    assert.ok(html.includes(`rel="canonical" href="${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://opiope.fi'}${path === '/' ? '' : path}"`), `Sitemap canonical: ${path}`)
  }
  const swedish = await (await request('/course/sv')).text()
  assert.ok(swedish.includes('Lär dig svenska'), 'Swedish metadata rendered')
  assert.ok(swedish.includes('content="sv_FI"'), 'Swedish social locale rendered')
  assert.ok((await (await request('/learn/academy/opiope-1')).text()).includes('noindex'), 'Legacy module is noindex')
  console.log(`Production HTTP smoke passed: ${checked} routes, including all 70 lessons, and 2 invalid-route checks.`)
  console.log(`SEO HTTP checks passed for all ${publicSeoPaths().length} public sitemap routes and their canonicals.`)
  console.log('HTTP rendering only; does not test browser clicks, device voices, or authenticated accounts.')
} finally {
  if (server.exitCode === null) { server.kill('SIGTERM'); await once(server, 'exit') }
}
