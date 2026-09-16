export type LessonDraftExerciseType = 'multiple_choice' | 'fill_blank' | 'sentence_order' | 'matching' | 'error_correction'

export interface GeneratedLessonDraft {
  language: 'fi' | 'sv'
  cefrLevel: 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  title: string
  objective: string
  sourceSummary: string
  lesson: {
    theory: string[]
    examples: Array<{ target: string; translation: string; note: string }>
  }
  vocabulary: Array<{ term: string; meaning: string; example: string }>
  grammar: Array<{ title: string; explanation: string; examples: string[] }>
  blackboard: Array<{ heading: string; body: string; emphasis: 'normal' | 'root' | 'suffix' | 'warning' }>
  exercises: Array<{
    type: LessonDraftExerciseType
    prompt: string
    options: string[]
    answer: string
    explanation: string
  }>
  flashcards: Array<{ front: string; back: string }>
  test: Array<{
    prompt: string
    options: string[]
    answer: string
    explanation: string
  }>
  teacherNotes: string[]
  limitations: string[]
}

