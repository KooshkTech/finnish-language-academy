import test from 'node:test'
import assert from 'node:assert/strict'
import ts from 'typescript'
import { readFile } from 'node:fs/promises'
import { auditFinnishCurriculum } from '../scripts/audit-finnish-curriculum.mjs'
import { finnishLessons, finnishLevelOrder } from '../data/finnish-curriculum.mjs'
import { isAcademyAnswerCorrect } from '../lib/academy-answer.mjs'

test('70 lessons meet curriculum structural audit', () => {
  assert.deepEqual(auditFinnishCurriculum(), { levels: 7, lessons: 70, questions: 721 })
})

test('choice checking preserves the Finnish language/country capitalisation distinction', () => {
  const question = finnishLessons.find(lesson => lesson.id === 'fi-a0-03').practice[0]
  assert.equal(isAcademyAnswerCorrect(question, 'suomi'), true)
  assert.equal(isAcademyAnswerCorrect(question, 'Suomi'), false)
  assert.equal(isAcademyAnswerCorrect(question, 'SUOMI'), false)
})

test('legacy short answers still allow trim, case and explicit alternatives', () => {
  assert.equal(isAcademyAnswerCorrect({answer:'olen'}, ' OLEN '), true)
  assert.equal(isAcademyAnswerCorrect({answer:'hei/moi'}, 'Moi'), true)
  assert.equal(isAcademyAnswerCorrect({answer:'olen'}, 'olet'), false)
})

test('actual published-content validator accepts all new lessons', async () => {
  const source = await readFile(new URL('../services/academy-content-validator.ts', import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
  const { validatePublishedAcademy } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
  assert.deepEqual(validatePublishedAcademy(finnishLessons), [])
})

test('prerequisites form a forward-only 70-lesson path', () => {
  for (const [index, lesson] of finnishLessons.entries()) {
    assert.deepEqual(lesson.prerequisites, index ? [finnishLessons[index - 1].id] : [])
  }
})

test('advanced lessons target interpretation and original production', () => {
  for (const level of finnishLevelOrder.slice(4)) {
    const lessons = finnishLessons.filter(lesson => lesson.level === level)
    assert.ok(lessons.every(lesson => lesson.reading.text.split(/\s+/).length >= 65))
    assert.equal(new Set(lessons.map(lesson => lesson.speaking.prompt)).size, 10)
    assert.equal(new Set(lessons.map(lesson => lesson.writing.prompt)).size, 10)
  }
})
