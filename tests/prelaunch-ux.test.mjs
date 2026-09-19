import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const home = fs.readFileSync('components/auth/CourseGateway.tsx', 'utf8')
const newcomer = fs.readFileSync('app/suomen-kurssi-maahanmuuttajille/page.tsx', 'utf8')

test('public entry offers a direct guest path and short start guide', () => {
  assert.match(home, /href="\/course\/fi\/levels"/)
  assert.match(home, /Aloita kolmessa vaiheessa/)
  assert.match(home, /Ei maksukorttia/)
  assert.match(home, /<nav[^>]+aria-label="Päävalikko"/)
})

test('newcomer landing page has useful content and structured data', () => {
  assert.match(newcomer, /Suomen kielen kurssi maahanmuuttajille/)
  assert.match(newcomer, /'@type': 'Course'/)
  assert.match(newcomer, /'@type': 'FAQPage'/)
  assert.match(newcomer, /href="\/course\/fi\/levels\/a0"/)
})
