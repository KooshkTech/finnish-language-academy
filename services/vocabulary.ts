import type { VocabularyProgress } from '@/types/learning'

export function createVocabularyProgress(word: string, translation: string): VocabularyProgress {
  const now = new Date().toISOString()
  return { word, translation, firstSeen: now, lastReviewed: null, nextReview: now, correctCount: 0, wrongCount: 0, interval: 0, easeFactor: 2.5, confidence: 0, mastery: 0 }
}

export function scheduleVocabularyReview(current: VocabularyProgress, correct: boolean, now = new Date()): VocabularyProgress {
  const correctCount = current.correctCount + (correct ? 1 : 0)
  const wrongCount = current.wrongCount + (correct ? 0 : 1)
  const easeFactor = Math.min(3, Math.max(1.3, current.easeFactor + (correct ? 0.08 : -0.2)))
  let interval = current.interval
  if (!correct) interval = 1
  else if (interval < 1) interval = 1
  else if (interval === 1) interval = 3
  else interval = Math.max(1, Math.round(interval * easeFactor))
  const next = new Date(now)
  next.setDate(next.getDate() + interval)
  const attempts = correctCount + wrongCount
  const confidence = attempts ? Math.round((correctCount / attempts) * 100) : 0
  const mastery = Math.min(100, Math.round(confidence * Math.min(1, Math.log2(attempts + 1) / 3)))
  return { ...current, correctCount, wrongCount, easeFactor, interval, confidence, mastery, lastReviewed: now.toISOString(), nextReview: next.toISOString() }
}

export function isDue(progress: VocabularyProgress, now = new Date()) {
  return new Date(progress.nextReview).getTime() <= now.getTime()
}
