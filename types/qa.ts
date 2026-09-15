export type QASkillType = 'speaking' | 'writing' | 'listening' | 'reading' | 'understanding' | 'vocabulary' | 'voice-lab'
export type QACefrLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type QAInputMode = 'text' | 'voice' | 'text-or-voice'

export interface QAQuestion {
  id: string
  skillType: QASkillType
  cefrLevel: QACefrLevel
  prompt: string
  stimulusText?: string
  passage?: string
  inputMode: QAInputMode
  expectedKeywords: string[]
  modelAnswer: {
    standardForm: string
    spokenForm: string
    translationEn: string
  }
  dictionaryHeadwords?: string[]
  explanationHint?: string
}

export interface QAEvaluationResponse {
  questionId: string
  skillType: QASkillType
  cefrLevel: QACefrLevel
  studentInputText: string
  studentAudioUrl?: string
  isCorrect: boolean
  scorePercentage: number
  evaluationMode: 'ai' | 'key-point-check'
  feedback: {
    overallSummary: string
    grammarCorrections: Array<{
      originalPhrase: string
      correctedPhrase: string
      ruleExplanation: string
    }>
    pronunciationFeedback?: Array<{
      targetWord: string
      phoneticIssue: string
      expectedIPA: string
      actualIPA: string
    }>
    pronunciationStatus?: string
    registerNote?: {
      currentRegister: 'Kirjakieli' | 'Puhekieli'
      alternativeRegisterForm: string
    }
    vocabularySuggestions?: Array<{
      word: string
      suggestion: string
      reason: string
    }>
  }
  modelAnswer: {
    standardForm: string
    spokenForm: string
    translationEn: string
  }
  nextQuestionPrompt?: {
    questionText: string
    audioUrl?: string
  }
}

