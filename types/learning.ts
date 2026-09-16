export type CefrLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type LearningLanguage = 'fi' | 'sv'

export type Profile = {
  display_name: string | null
  level: string | null
  goal: string | null
  daily_minutes: number | null
}

export type PlacementResult = {
  language?: LearningLanguage
  estimatedLevel: CefrLevel
  score: number
  total: number
  categoryScores: Record<string, { correct: number; total: number }>
  recommendedLesson: string
  completedAt: string
}

export type GrammarAttempt = {
  exerciseId: string
  topic: string
  selectedAnswer: string
  isCorrect: boolean
  attemptedAt: string
  language?: LearningLanguage
  lessonSlug?: string
  questionText?: string
  correctAnswer?: string
  explanation?: string
}

export type VocabularyProgress = {
  word: string
  translation: string
  firstSeen: string
  lastReviewed: string | null
  nextReview: string
  correctCount: number
  wrongCount: number
  interval: number
  easeFactor: number
  confidence: number
  mastery: number
}

export type LessonProgress = {
  lessonSlug: string
  startedAt: string
  completedAt: string | null
  progressPercent: number
  lastPosition: number
}

export type GuestLearningState = {
  version: 1
  placementResult: PlacementResult | null
  recommendedLesson: string | null
  lessonProgress: Record<string, LessonProgress>
  grammarAttempts: GrammarAttempt[]
  vocabularyProgress: Record<string, VocabularyProgress>
}

export type DashboardData = {
  placementResult: PlacementResult | null
  currentLesson: LessonProgress | null
  weakGrammarTopics: string[]
  dueVocabulary: number
  masteredVocabulary: number
  completedLessons: number
  recentActivityCount: number
}
