'use client'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { loadGuestState, saveGuestState } from '@/services/guest-progress'
import { createVocabularyProgress, scheduleVocabularyReview } from '@/services/vocabulary'
import type { LearningLanguage, VocabularyProgress } from '@/types/learning'

type ReviewWordInput = {
  language: LearningLanguage
  word: string
  meaning: string
}

function localKey(language: LearningLanguage, word: string) {
  return `${language}:${word.trim().toLocaleLowerCase(language === 'sv' ? 'sv-SE' : 'fi-FI')}`
}

function rowToProgress(row: Record<string, unknown>): VocabularyProgress {
  return {
    word: String(row.word ?? ''),
    translation: String(row.translation ?? row.word ?? ''),
    firstSeen: String(row.first_seen ?? new Date().toISOString()),
    lastReviewed: row.last_reviewed ? String(row.last_reviewed) : null,
    nextReview: String(row.next_review ?? new Date().toISOString()),
    correctCount: Number(row.correct_count ?? 0),
    wrongCount: Number(row.wrong_count ?? 0),
    interval: Number(row.interval ?? 0),
    easeFactor: Number(row.ease_factor ?? 2.5),
    confidence: Number(row.confidence ?? 0),
    mastery: Number(row.mastery ?? 0),
  }
}

function progressToRow(userId: string, language: LearningLanguage, progress: VocabularyProgress) {
  return {
    user_id: userId,
    learning_language: language,
    word: progress.word,
    translation: progress.translation,
    first_seen: progress.firstSeen,
    last_reviewed: progress.lastReviewed,
    next_review: progress.nextReview,
    correct_count: progress.correctCount,
    wrong_count: progress.wrongCount,
    interval: progress.interval,
    ease_factor: progress.easeFactor,
    confidence: progress.confidence,
    mastery: progress.mastery,
    updated_at: new Date().toISOString(),
  }
}

export async function addWordToReview({ language, word, meaning }: ReviewWordInput) {
  const cleanWord = word.trim()
  if (!cleanWord) return { signedIn: false }

  const fresh = createVocabularyProgress(cleanWord, meaning.trim() || cleanWord)

  if (!isSupabaseConfigured()) {
    const state = loadGuestState()
    const key = localKey(language, cleanWord)
    saveGuestState({
      ...state,
      vocabularyProgress: {
        ...state.vocabularyProgress,
        [key]: state.vocabularyProgress[key] ?? fresh,
      },
    })
    return { signedIn: false }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const state = loadGuestState()
    const key = localKey(language, cleanWord)
    saveGuestState({
      ...state,
      vocabularyProgress: {
        ...state.vocabularyProgress,
        [key]: state.vocabularyProgress[key] ?? fresh,
      },
    })
    return { signedIn: false }
  }

  const { data: existing, error: readError } = await supabase
    .from('vocabulary_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('learning_language', language)
    .eq('word', cleanWord)
    .maybeSingle()
  if (readError) throw readError

  if (!existing) {
    const { error } = await supabase.from('vocabulary_progress').insert(progressToRow(user.id, language, fresh))
    if (error) throw error
  }
  return { signedIn: true }
}

export async function reviewWord(language: LearningLanguage, word: string, correct: boolean) {
  const cleanWord = word.trim()
  if (!isSupabaseConfigured()) {
    const state = loadGuestState()
    const key = localKey(language, cleanWord)
    const current = state.vocabularyProgress[key]
    if (!current) return null
    const next = scheduleVocabularyReview(current, correct)
    saveGuestState({ ...state, vocabularyProgress: { ...state.vocabularyProgress, [key]: next } })
    return next
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const state = loadGuestState()
    const key = localKey(language, cleanWord)
    const current = state.vocabularyProgress[key]
    if (!current) return null
    const next = scheduleVocabularyReview(current, correct)
    saveGuestState({ ...state, vocabularyProgress: { ...state.vocabularyProgress, [key]: next } })
    return next
  }

  const { data, error } = await supabase
    .from('vocabulary_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('learning_language', language)
    .eq('word', cleanWord)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const next = scheduleVocabularyReview(rowToProgress(data as Record<string, unknown>), correct)
  const { error: updateError } = await supabase
    .from('vocabulary_progress')
    .update(progressToRow(user.id, language, next))
    .eq('user_id', user.id)
    .eq('learning_language', language)
    .eq('word', cleanWord)
  if (updateError) throw updateError
  return next
}

