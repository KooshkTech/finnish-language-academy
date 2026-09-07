import type { SupabaseClient } from '@supabase/supabase-js'
import type { GuestLearningState, LessonProgress } from '@/types/learning'
import { saveLessonProgress, savePlacementResult, saveUserProgress } from '@/services/progress'

function maxDate(a: string | null, b: string | null) {
  if (!a) return b
  if (!b) return a
  return new Date(a) >= new Date(b) ? a : b
}

export async function migrateGuestProgress(supabase: SupabaseClient, userId: string, guest: GuestLearningState) {
  if (guest.placementResult) {
    const { data, error } = await supabase.from('placement_results').select('id').eq('user_id', userId).eq('completed_at', guest.placementResult.completedAt).maybeSingle()
    if (error) throw error
    if (!data) await savePlacementResult(supabase, userId, guest.placementResult)
  }

  for (const lesson of Object.values(guest.lessonProgress)) {
    const { data, error } = await supabase.from('lesson_progress').select('*').eq('user_id', userId).eq('lesson_slug', lesson.lessonSlug).maybeSingle()
    if (error) throw error
    const merged: LessonProgress = data ? {
      lessonSlug: lesson.lessonSlug,
      startedAt: new Date(data.started_at) <= new Date(lesson.startedAt) ? data.started_at : lesson.startedAt,
      completedAt: maxDate(data.completed_at, lesson.completedAt),
      progressPercent: Math.max(data.progress_percent ?? 0, lesson.progressPercent),
      lastPosition: Math.max(data.last_position ?? 0, lesson.lastPosition),
    } : lesson
    await saveLessonProgress(supabase, userId, merged)
  }

  for (const attempt of guest.grammarAttempts) {
    const { data, error } = await supabase.from('exercise_attempts').select('id').eq('user_id', userId).eq('exercise_id', attempt.exerciseId).eq('attempted_at', attempt.attemptedAt).maybeSingle()
    if (error) throw error
    if (!data) {
      const { error: insertError } = await supabase.from('exercise_attempts').insert({ user_id: userId, lesson_slug: 'grammar-basics', exercise_id: attempt.exerciseId, grammar_topic: attempt.topic, answer: attempt.selectedAnswer, is_correct: attempt.isCorrect, attempted_at: attempt.attemptedAt })
      if (insertError) throw insertError
    }
  }

  for (const v of Object.values(guest.vocabularyProgress)) {
    const { data, error } = await supabase.from('vocabulary_progress').select('*').eq('user_id', userId).eq('word', v.word).maybeSingle()
    if (error) throw error
    const merged = data ? {
      ...v,
      firstSeen: new Date(data.first_seen) <= new Date(v.firstSeen) ? data.first_seen : v.firstSeen,
      lastReviewed: maxDate(data.last_reviewed, v.lastReviewed),
      nextReview: maxDate(data.next_review, v.nextReview) ?? v.nextReview,
      correctCount: Math.max(data.correct_count ?? 0, v.correctCount),
      wrongCount: Math.max(data.wrong_count ?? 0, v.wrongCount),
      interval: Math.max(data.interval ?? 0, v.interval),
      easeFactor: Math.max(Number(data.ease_factor ?? 1.3), v.easeFactor),
      confidence: Math.max(data.confidence ?? 0, v.confidence),
      mastery: Math.max(data.mastery ?? 0, v.mastery),
    } : v
    const { error: saveError } = await supabase.from('vocabulary_progress').upsert({ user_id: userId, word: merged.word, translation: merged.translation, first_seen: merged.firstSeen, last_reviewed: merged.lastReviewed, next_review: merged.nextReview, correct_count: merged.correctCount, wrong_count: merged.wrongCount, interval: merged.interval, ease_factor: merged.easeFactor, confidence: merged.confidence, mastery: merged.mastery, updated_at: new Date().toISOString() }, { onConflict: 'user_id,word' })
    if (saveError) throw saveError
  }

  await saveUserProgress(supabase, userId, guest.placementResult?.estimatedLevel ?? null, guest.recommendedLesson)
}
