export type AcademyLevel = 'A0'|'A1'|'A2'|'B1'|'B2'|'C1'|'C2'
export type AcademyBookId = 'fi-a0'|'fi-a1'|'fi-a2'|'fi-b1'|'fi-b2'|'fi-c1'|'fi-c2'|'opiope-1'|'opiope-2'|'opiope-3'|'opiope-4'|'opiope-5'|'opiope-6'|'opiope-yki'
export type AcademySkill = 'reading'|'listening'|'grammar'|'practice'|'speaking'|'writing'|'mastery'

export type AcademyVocabularyItem = {
  fi: string
  en: string
  definitionFi?: string
  sv?: string
  partOfSpeech: string
  cefr: AcademyLevel
  example: string
  note?: string
}

export type AcademyQuestion = {
  id: string
  type: 'multiple-choice'|'true-false'|'short-answer'|'fill-blank'
  prompt: string
  options?: string[]
  answer: string
  explanation: string
  skill: AcademySkill
}

export type AcademyLesson = {
  differentiatedTasks?: { easier: string; harder: string }
  id: string
  bookId: AcademyBookId
  level: AcademyLevel
  number: number
  title: string
  topic: string
  estimatedMinutes: number
  difficulty: 'starter'|'easy'|'medium'|'advanced'|'mastery'
  objectives: string[]
  prerequisites: string[]
  vocabulary: AcademyVocabularyItem[]
  grammarTargets: string[]
  skills: AcademySkill[]
  contentVersion: number
  published: boolean
  updatedAt: string
  warmup: string
  reading: {
    title: string
    text: string
    translationEn: string
    questions: AcademyQuestion[]
  }
  listening: {
    title: string
    transcript: string
    speedGuidance: string
    questions: AcademyQuestion[]
  }
  grammar: {
    discover: string[]
    explain: string
    deconstruct: string[]
    compare: string[]
    questions: AcademyQuestion[]
  }
  practice: AcademyQuestion[]
  speaking: {
    prompt: string
    model: string
    roleplay: string[]
  }
  writing: {
    prompt: string
    checklist: string[]
    model: string
  }
  masteryTest: AcademyQuestion[]
  review: string[]
}

export type AcademyBook = {
  id: AcademyBookId
  title: string
  subtitle: string
  levelRange: string
  description: string
  focus: string[]
  lessonTitles: string[]
  publishedLessonIds: string[]
}
