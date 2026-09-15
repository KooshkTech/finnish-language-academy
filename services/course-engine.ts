import type { CourseExercise, CourseLesson, LessonAttemptResult } from '@/types/course'

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('fi-FI').replace(/[.!?]+$/g, '')
}

export function evaluateExercise(exercise: CourseExercise, answer: string): LessonAttemptResult {
  const accepted = [exercise.correctAnswer, ...(exercise.acceptableAnswers ?? [])].map(normalize)
  const isCorrect = accepted.includes(normalize(answer))
  return {
    exerciseId: exercise.id,
    answer,
    isCorrect,
    pointsEarned: isCorrect ? exercise.points : 0,
    explanation: exercise.explanation,
  }
}

export function requiredExerciseIds(lesson: CourseLesson) {
  return new Set(
    lesson.activities
      .filter(activity => activity.required)
      .flatMap(activity => activity.exerciseIds),
  )
}

export function lessonCompletionPercent(lesson: CourseLesson, results: LessonAttemptResult[]) {
  const required = requiredExerciseIds(lesson)
  if (required.size === 0) return 100
  const passed = new Set(results.filter(result => result.isCorrect).map(result => result.exerciseId))
  const completedRequired = [...required].filter(id => passed.has(id)).length
  return Math.round((completedRequired / required.size) * 100)
}

export function canCompleteLesson(lesson: CourseLesson, results: LessonAttemptResult[]) {
  return lessonCompletionPercent(lesson, results) === 100
}

export function lessonScore(results: LessonAttemptResult[]) {
  return results.reduce((sum, result) => sum + result.pointsEarned, 0)
}

