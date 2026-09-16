export type LearningLanguage = "fi" | "sv"
export type CefrLevel = "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
export type DictionaryRegister = "standard" | "spoken" | "formal" | "slang" | "technical" | "archaic"
export type PartOfSpeech = "verb" | "noun" | "adjective" | "adverb" | "postposition" | "preposition" | "pronoun" | "conjunction" | "particle"

export interface DictionaryExample {
  kirjakieli: string
  puhekieli?: string
  translationEn: string
  grammaticalNotes: string
}

export interface DictionaryDefinition {
  senseNumber: number
  definitionEn: string
  definitionNative: string
  register: DictionaryRegister
  cefrLevel: Exclude<CefrLevel, "A0">
  examples: DictionaryExample[]
}

export interface FinnishMorphology {
  language: "fi"
  kotusTypeNumber?: number
  gradationTier?: string
  infinitiveStem?: string
  conjugationGroup?: string
  vowelHarmony: "front" | "back" | "neutral"
}

export interface SwedishMorphology {
  language: "sv"
  gender?: "en" | "ett" | "none"
  pluralForms?: string[]
  pitchAccent?: "accent-1" | "accent-2" | "variable" | "unknown"
  conjugationGroup?: string
}

export interface DictionaryEntry {
  id: string
  language: LearningLanguage
  headword: string
  normalizedHeadword: string
  ipaPhonetic: string
  audioUrlStandard?: string
  audioUrlSpoken?: string
  partOfSpeech: PartOfSpeech
  cefrLevel: Exclude<CefrLevel, "A0">
  morphology: FinnishMorphology | SwedishMorphology
  definitions: DictionaryDefinition[]
  collocations: Array<{ phrase: string; translationEn: string }>
  idioms: Array<{ phrase: string; translationEn: string }>
  synonyms: string[]
  antonyms: string[]
  sourceNote: string
}

export interface DictionarySearchResult {
  query: string
  entries: DictionaryEntry[]
}

