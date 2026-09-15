export type LearningSpeechLanguage = 'fi' | 'sv'

export function localeFor(language: LearningSpeechLanguage) {
  return language === 'sv' ? 'sv-SE' : 'fi-FI'
}

export function findLearningVoice(language: LearningSpeechLanguage) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  const prefix = language === 'sv' ? 'sv' : 'fi'
  return window.speechSynthesis.getVoices().find(voice => voice.lang.toLowerCase().startsWith(prefix)) ?? null
}

export function speakLearningText(text: string, language: LearningSpeechLanguage, rate = 1) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return { ok: false as const, reason: 'unsupported' as const }
  const voice = findLearningVoice(language)
  if (!voice) return { ok: false as const, reason: 'voice-missing' as const }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = localeFor(language)
  utterance.voice = voice
  utterance.rate = rate
  window.speechSynthesis.speak(utterance)
  return { ok: true as const, utterance }
}

