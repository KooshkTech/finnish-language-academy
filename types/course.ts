import type { CefrLevel, LearningLanguage } from '@/types/learning'

export type CourseStatus = 'published' | 'development'
export type ExerciseType = 'multiple-choice' | 'fill-blank' | 'translation' | 'error-correction'
export type Skill = 'vocabulary' | 'grammar' | 'reading' | 'writing' | 'speaking' | 'listening'

export type CourseExercise = {
  id: string
  type: ExerciseType
  prompt: string
  options?: string[]
  correctAnswer: string
  acceptableAnswers?: string[]
  explanation: string
  hint?: string
  skill: Skill
  points: number
}

export type LessonActivity = {
  id: string
  title: string
  kind: 'learn' | 'understand' | 'practice' | 'apply' | 'check'
  content: string
  required: boolean
  exerciseIds: string[]
}

export type CourseLesson = {
  id: string
  slug: string
  title: string
  objective: string
  estimatedMinutes: number
  activities: LessonActivity[]
  exercises: CourseExercise[]
}

export type CourseUnit = {
  id: string
  title: string
  lessons: CourseLesson[]
}

export type CourseModule = {
  id: string
  title: string
  units: CourseUnit[]
}

export type CourseDefinition = {
  id: string
  language: LearningLanguage
  level: CefrLevel
  title: string
  description: string
  status: CourseStatus
  modules: CourseModule[]
}

export type LessonAttemptResult = {
  exerciseId: string
  answer: string
  isCorrect: boolean
  pointsEarned: number
  explanation: string
}

