import type { AcademyLesson } from '@/types/academy'

export type AcademyValidationIssue = { lessonId: string; field: string; message: string }

export function validateAcademyLesson(lesson: AcademyLesson): AcademyValidationIssue[] {
  const issues: AcademyValidationIssue[] = []
  const need = (ok:boolean, field:string, message:string) => { if (!ok) issues.push({ lessonId: lesson.id, field, message }) }
  need(lesson.objectives.length > 0, 'objectives', 'Lesson must have learning objectives.')
  need(lesson.vocabulary.length >= 2, 'vocabulary', 'Published lesson must have structured vocabulary.')
  need(Boolean(lesson.reading.text.trim()), 'reading', 'Published lesson must have reading text.')
  need(lesson.reading.questions.length > 0, 'reading.questions', 'Reading must have questions.')
  need(Boolean(lesson.listening.transcript.trim()), 'listening', 'Published lesson must have listening content/transcript.')
  need(lesson.listening.questions.length > 0, 'listening.questions', 'Listening must have questions.')
  need(Boolean(lesson.grammar.explain.trim()), 'grammar', 'Published lesson must have grammar explanation.')
  need(lesson.grammar.questions.length > 0, 'grammar.questions', 'Grammar must have exercises.')
  need(lesson.practice.length > 0, 'practice', 'Published lesson must have interactive practice.')
  need(Boolean(lesson.speaking.prompt.trim()), 'speaking', 'Published lesson must have speaking production.')
  need(Boolean(lesson.writing.prompt.trim()), 'writing', 'Published lesson must have writing production.')
  need(lesson.masteryTest.length > 0, 'masteryTest', 'Published lesson must have a mastery test.')
  for (const question of [...lesson.reading.questions, ...lesson.listening.questions, ...lesson.grammar.questions, ...lesson.practice, ...lesson.masteryTest]) {
    need(Boolean(question.answer.trim()), `question:${question.id}`, 'Every question must have an answer.')
    need(Boolean(question.explanation.trim()), `question:${question.id}`, 'Every question must have an explanation.')
  }
  return issues
}

export function validatePublishedAcademy(lessons: AcademyLesson[]) {
  return lessons.filter(lesson => lesson.published).flatMap(validateAcademyLesson)
}

