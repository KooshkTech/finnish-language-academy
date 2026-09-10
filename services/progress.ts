import type { SupabaseClient } from '@supabase/supabase-js'
import type { DashboardData, LessonProgress, PlacementResult } from '@/types/learning'

export async function savePlacementResult(supabase: SupabaseClient, userId: string, result: PlacementResult) {
  const { error } = await supabase.from('placement_results').upsert({ user_id: userId, estimated_level: result.estimatedLevel, score: result.score, total: result.total, category_scores: result.categoryScores, recommended_lesson: result.recommendedLesson, completed_at: result.completedAt }, { onConflict: 'user_id,completed_at' })
  if (error) throw error
}

export async function saveLessonProgress(supabase: SupabaseClient, userId: string, progress: LessonProgress) {
  const { error } = await supabase.from('lesson_progress').upsert({ user_id: userId, lesson_slug: progress.lessonSlug, started_at: progress.startedAt, completed_at: progress.completedAt, progress_percent: progress.progressPercent, last_position: progress.lastPosition, updated_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_slug' })
  if (error) throw error
}

export async function recordDailyActivity(supabase: SupabaseClient, userId: string) {
  const activityDate = new Date().toISOString().slice(0, 10)
  const { data } = await supabase.from('daily_activity').select('exercises,minutes').eq('user_id', userId).eq('activity_date', activityDate).maybeSingle()
  const { error } = await supabase.from('daily_activity').upsert({ user_id: userId, activity_date: activityDate, exercises: (data?.exercises ?? 0) + 1, minutes: data?.minutes ?? 0, updated_at: new Date().toISOString() }, { onConflict: 'user_id,activity_date' })
  if (error) throw error
}

export async function saveUserProgress(supabase: SupabaseClient, userId: string, currentLevel: string | null, currentLesson: string | null) {
  const { error } = await supabase.from('user_progress').upsert({ user_id: userId, current_level: currentLevel, current_lesson: currentLesson, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function loadDashboardData(supabase: SupabaseClient, userId: string): Promise<DashboardData> {
  const [placement, lessons, attempts, vocabulary, activity] = await Promise.all([
    supabase.from('placement_results').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('lesson_progress').select('*').eq('user_id', userId),
    supabase.from('exercise_attempts').select('grammar_topic,is_correct').eq('user_id', userId),
    supabase.from('vocabulary_progress').select('next_review,mastery').eq('user_id', userId),
    supabase.from('daily_activity').select('activity_date').eq('user_id', userId).order('activity_date', { ascending: false }).limit(14),
  ])
  const lessonRows = lessons.data ?? []
  const attemptRows = attempts.data ?? []
  const vocabularyRows = vocabulary.data ?? []
  const counts = new Map<string, { wrong: number; total: number }>()
  for (const attempt of attemptRows) { if (!attempt.grammar_topic) continue; const item = counts.get(attempt.grammar_topic) ?? { wrong: 0, total: 0 }; item.total += 1; if (!attempt.is_correct) item.wrong += 1; counts.set(attempt.grammar_topic, item) }
  return { placementResult: placement.data ? { estimatedLevel: placement.data.estimated_level, score: placement.data.score, total: placement.data.total, categoryScores: placement.data.category_scores ?? {}, recommendedLesson: placement.data.recommended_lesson, completedAt: placement.data.completed_at } : null, currentLesson: lessonRows.find(row => !row.completed_at) ?? lessonRows[0] ?? null, weakGrammarTopics: [...counts].filter(([, value]) => value.wrong / value.total >= 0.4).map(([topic]) => topic).slice(0, 3), dueVocabulary: vocabularyRows.filter(row => new Date(row.next_review).getTime() <= Date.now()).length, masteredVocabulary: vocabularyRows.filter(row => (row.mastery ?? 0) >= 70).length, completedLessons: lessonRows.filter(row => Boolean(row.completed_at)).length, recentActivityCount: activity.data?.length ?? 0 }
}
