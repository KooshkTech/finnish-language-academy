import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { finnishLessons } from '../data/finnish-curriculum.mjs'
import { studentWorksheet, teacherAnswerKey } from '../lib/teacher-draft-export.mjs'

test('stylesheet is byte-identical to V24.22.1 baseline', async () => {
  const css = await readFile(new URL('../app/globals.css', import.meta.url))
  assert.equal(createHash('sha256').update(css).digest('hex'), 'e8fd1ad5038b46d972c1928f8a99032d6fd5220fe477145eab3c1355b4f04563')
  const layout = await readFile(new URL('../app/layout.tsx', import.meta.url), 'utf8')
  assert.ok(!layout.includes('v24.css') && !layout.includes('ReleaseSurface'))
})

test('all 70 Finnish lessons have Finnish definitions and no old English support', () => {
  const english = /\b(?:English|means|infinitive|first person|would come|I do not|faster|necessarily|depending on|not necessarily|Comparative|Superlative)\b/i
  for (const lesson of finnishLessons) {
    assert.equal(lesson.reading.translationEn, '')
    assert.ok(lesson.vocabulary.every(item => item.en === '' && item.definitionFi.trim()))
    for (const content of [lesson.title, lesson.grammar.explain, ...lesson.review,
      ...[lesson.reading.questions, lesson.listening.questions, lesson.grammar.questions, lesson.practice, lesson.masteryTest].flat().flatMap(item => [item.prompt, item.explanation, ...(item.options || [])])]) {
      assert.ok(!english.test(content), `${lesson.id}: ${content}`)
    }
  }
})

test('each level includes productive gap tasks and differentiated speaking practice', () => {
  for (const lesson of finnishLessons) {
    assert.equal(lesson.grammar.questions[0].type, 'fill-blank')
    assert.equal(lesson.grammar.questions[0].options, undefined)
    assert.ok(lesson.differentiatedTasks.easier.includes(lesson.speaking.prompt))
    assert.ok(lesson.differentiatedTasks.harder.includes('ilman mallitekstiä'))
  }
})

const draft = { language: 'fi', cefrLevel: 'A1', title: 'Harjoitus', objective: 'Harjoittele',
  lesson: { theory: ['Lue teksti.'], examples: [{ target: 'Olen kotona.', translation: 'PRIVATE TRANSLATION' }] },
  exercises: [{ prompt: 'Täydennä lause.', options: ['A', 'B'], answer: 'PRIVATE ANSWER', explanation: 'PRIVATE EXPLANATION' }],
  test: [{ prompt: 'Kertaa lause.', options: [], answer: 'PRIVATE TEST ANSWER', explanation: 'PRIVATE TEST EXPLANATION' }], teacherNotes: ['PRIVATE TEACHER NOTE'] }

test('student worksheet never includes teacher-only fields or answers', () => {
  const text = studentWorksheet(draft)
  assert.ok(text.includes('Opiskelijan tehtävämoniste') && text.includes('Täydennä lause.'))
  assert.ok(!text.includes('PRIVATE'))
})

test('teacher key includes exercise and test answers', () => {
  const text = teacherAnswerKey(draft)
  assert.ok(text.includes('PRIVATE ANSWER') && text.includes('PRIVATE TEST ANSWER'))
  assert.ok(text.includes('ei opiskelijoille'))
})

test('Swedish exports have Swedish headings', () => {
  const sv = { ...draft, language: 'sv' }
  assert.ok(studentWorksheet(sv).startsWith('Elevens arbetsblad'))
  assert.ok(teacherAnswerKey(sv).startsWith('Lärarens facit'))
})
