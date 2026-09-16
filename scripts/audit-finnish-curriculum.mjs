import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { finnishLessons, finnishLevelBooks, finnishLevelOrder } from '../data/finnish-curriculum.mjs'

export function auditFinnishCurriculum() {
  assert.equal(finnishLessons.length, 70, 'Exactly 70 new Finnish lessons')
  assert.equal(finnishLevelBooks.length, 7)
  const ids = new Set(finnishLessons.map(lesson => lesson.id))
  assert.equal(ids.size, 70, 'Unique lesson IDs')
  for (const level of finnishLevelOrder) {
    const lessons = finnishLessons.filter(lesson => lesson.level === level)
    const book = finnishLevelBooks.find(item => item.levelRange === level)
    assert.equal(lessons.length, 10, `${level}: ten lessons`)
    assert.deepEqual(lessons.map(lesson => lesson.number), [1,2,3,4,5,6,7,8,9,10])
    assert.deepEqual(book.publishedLessonIds, lessons.map(lesson => lesson.id))
    assert.deepEqual(book.lessonTitles, lessons.map(lesson => lesson.title))
    const review = lessons[9]
    assert.equal(review.masteryTest.length, 5, `${level}: cumulative review`)
    for (const number of [1, 4, 7]) assert.ok(review.masteryTest.some(question =>
      question.prompt === lessons[number - 1].practice[0].prompt), `${level}: retrieves lesson ${number}`)
  }
  let questions = 0
  for (const lesson of finnishLessons) {
    const label = lesson.id
    assert.ok(lesson.published)
    assert.ok(finnishLevelBooks.some(book => book.id === lesson.bookId), `${label}: book resolves`)
    assert.ok(lesson.objectives.length >= 3)
    assert.ok(lesson.vocabulary.length >= 4)
    assert.ok(lesson.grammarTargets.length > 0)
    assert.ok(lesson.reading.text.length > 80)
    assert.equal(lesson.reading.translationEn, '')
    assert.ok(lesson.vocabulary.every(item => item.en === '' && item.definitionFi.trim()))
    assert.ok(lesson.listening.transcript.length > 60)
    assert.notEqual(lesson.reading.text, lesson.listening.transcript)
    assert.ok(lesson.listening.speedGuidance.includes('ei äänitettyä'))
    for (const field of [lesson.grammar.explain, lesson.speaking.prompt, lesson.speaking.model, lesson.writing.prompt, lesson.writing.model]) assert.ok(field.trim(), `${label}: content not empty`)
    assert.ok(lesson.writing.checklist.length >= 3 && lesson.review.length >= 3)
    for (const prerequisite of lesson.prerequisites) assert.ok(ids.has(prerequisite), `${label}: prerequisite resolves`)
    const lessonQuestions = [lesson.reading.questions, lesson.listening.questions, lesson.grammar.questions, lesson.practice, lesson.masteryTest]
    const questionIds = new Set()
    for (const section of lessonQuestions) {
      assert.ok(section.length > 0, `${label}: each exercise section populated`)
      for (const question of section) {
        assert.ok(!questionIds.has(question.id), `${label}: unique question IDs`)
        questionIds.add(question.id)
        assert.ok(question.prompt.trim() && question.answer.trim() && question.explanation.trim())
        if (question.options) {
          assert.ok(question.options.includes(question.answer))
          assert.equal(new Set(question.options).size, question.options.length)
          assert.equal(question.options.filter(option => option === question.answer).length, 1)
        } else assert.equal(question.type, 'fill-blank')
        questions++
      }
    }
  }
  assert.equal(new Set(finnishLessons.map(lesson => lesson.reading.text)).size, 70)
  assert.equal(new Set(finnishLessons.map(lesson => lesson.listening.transcript)).size, 70)
  return { levels: 7, lessons: 70, questions }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log('Finnish curriculum audit passed:', auditFinnishCurriculum())
  console.log('Structural audit only: difficulty and naturalness still require a Finnish teacher’s review.')
}
