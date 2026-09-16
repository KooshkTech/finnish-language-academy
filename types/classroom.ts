export type LearningRoute =
  | "/dictionary"
  | "/voice-lab"
  | "/arcade"
  | "/listening"
  | "/reading"
  | "/writing"
  | "/speaking"
  | "/understanding"
  | "/vocabulary"
  | "/yki-test"
  | "/ai-tutor"

export type SkillSlug = LearningRoute extends `/${infer S}` ? S : never

export type BlackboardBlock =
  | { type: "note"; title: string; body: string }
  | { type: "compare"; title: string; leftLabel: string; left: string; rightLabel: string; right: string }
  | { type: "table"; title: string; rows: Array<[string, string]> }

export interface SkillModule {
  route: LearningRoute
  title: string
  subtitle: string
  levelRange: string
  learn: string[]
  examples: Array<{ source: string; target: string; note?: string }>
  blackboard: BlackboardBlock[]
  flashcards: Array<{ front: string; back: string }>
  practice?: Array<{ question: string; options: string[]; answer: string; explanation: string }>
  test: Array<{ question: string; options: string[]; answer: string; explanation: string }>
}

export interface WeeklyTask {
  day: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN"
  assignedModule: LearningRoute
  title: string
  minutes: number
  requiredScore?: number
  isMandatory?: boolean
}

export interface UserAccountabilityState {
  userId: string
  cefrLevel: "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  currentStreak: number
  xpTotal: number
  kultaBalance: number
  heartsRemaining: number
  weeklySchedule: Array<{
    dayOfWeek: WeeklyTask["day"]
    assignedModule: LearningRoute
    homeworkTaskId: string
    isCompleted: boolean
    dueDate: string
  }>
  penaltyStatus: { isDetentionActive: boolean; missedCountThisWeek: number }
}

