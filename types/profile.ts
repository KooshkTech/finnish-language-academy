import type { CefrLevel } from "./dictionary"

export type AgeTier = "kids" | "youth" | "adult"
export type Mascot = "bear" | "fox" | "owl"
export type TeacherVoice = "warm-teacher" | "friendly-mascot" | "academic-pro"

export interface LearningProfileState {
  userId?: string
  ageTier: AgeTier
  selectedMascot?: Mascot
  cefrLevel: CefrLevel
  learningLanguage: "fi" | "sv"
  intensity: "casual" | "intensive" | "exam-sprint"
  voicePreferences: {
    speechRate: 0.5 | 0.75 | 1 | 1.25
    autoListenAfterAiSpeaks: boolean
    aiVoiceModel: TeacherVoice
  }
}

export const defaultLearningProfile: LearningProfileState = {
  ageTier: "adult",
  cefrLevel: "A0",
  learningLanguage: "fi",
  intensity: "casual",
  voicePreferences: {
    speechRate: 1,
    autoListenAfterAiSpeaks: false,
    aiVoiceModel: "academic-pro",
  },
}

