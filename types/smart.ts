export type SmartOptionKey =
  | 'meaning'
  | 'grammar'
  | 'sentences'
  | 'inflection'
  | 'spoken'
  | 'synonyms'
  | 'blackboard'
  | 'ai'

export type SmartStudySettings = Record<SmartOptionKey, boolean>

export type SmartSection = {
  key: SmartOptionKey | 'notice'
  title: string
  body: string
  examples?: string[]
}

export type TeacherPreferences = {
  compactMode: boolean
  showAnswerImmediately: boolean
  requireBlackboardWork: boolean
  strictAssessment: boolean
  showExternalResources: boolean
  showSmartAssistant: boolean
}

