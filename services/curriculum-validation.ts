import { representativeLessons } from '@/data/curriculum'

export type CurriculumIssue = { lesson: string; field: string; message: string }

export function validateRepresentativeCurriculum() {
  const issues: CurriculumIssue[] = []
  for (const lesson of representativeLessons) {
    if (!lesson.objectives.length) issues.push({ lesson: lesson.slug, field: 'objectives', message: 'Lesson needs at least one objective.' })
    if (!lesson.reading.text) issues.push({ lesson: lesson.slug, field: 'reading.text', message: 'Lesson needs reading text.' })
    if (!lesson.listening.transcript) issues.push({ lesson: lesson.slug, field: 'listening.transcript', message: 'Lesson needs a listening transcript.' })
    if (!lesson.grammar.exercises.length) issues.push({ lesson: lesson.slug, field: 'grammar.exercises', message: 'Lesson needs grammar practice.' })
    if (!lesson.practice.length) issues.push({ lesson: lesson.slug, field: 'practice', message: 'Lesson needs interactive practice.' })
    if (!lesson.speaking.prompt) issues.push({ lesson: lesson.slug, field: 'speaking.prompt', message: 'Lesson needs a speaking task.' })
    if (!lesson.masteryTest.length) issues.push({ lesson: lesson.slug, field: 'masteryTest', message: 'Lesson needs a mastery test.' })
    for (const exercise of [...lesson.reading.questions, ...lesson.listening.questions, ...lesson.grammar.exercises, ...lesson.practice, ...lesson.masteryTest]) {
      if (!exercise.answer) issues.push({ lesson: lesson.slug, field: exercise.id, message: 'Exercise needs an answer.' })
      if (!exercise.explanation) issues.push({ lesson: lesson.slug, field: exercise.id, message: 'Exercise needs an explanation.' })
    }
  }
  return issues
}
