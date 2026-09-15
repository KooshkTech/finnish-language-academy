import type { CefrLevel } from "./dictionary"

export interface AssessmentItemResult {
  question: string
  selectedAnswer?: string
  correctAnswer: string
  isCorrect: boolean
  explanation: string
  dictionaryHeadwords?: string[]
}

export interface AssessmentReport {
  moduleTitle: string
  completedAt: string
  totalItems: number
  correctItems: number
  percentage: number
  letterGrade: "A" | "B" | "C" | "D" | "E" | "F"
  practiceBand: CefrLevel
  disclaimer: string
  items: AssessmentItemResult[]
}

