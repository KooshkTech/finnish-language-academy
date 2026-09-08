import type { SupabaseClient } from '@supabase/supabase-js'
<<<<<<< HEAD
import type { LessonProgress, PlacementResult } from '@/types/learning'

export async function savePlacementResult(supabase: SupabaseClient, userId: string, result: PlacementResult) { const { error } = await supabase.from('placement_results').insert({ user_id: userId, level: result.estimatedLevel, grammar_score: result.categoryScores.grammar?.correct ?? 0, vocabulary_score: result.categoryScores.vocabulary?.correct ?? 0, reading_score: result.categoryScores.reading?.correct ?? 0, answers: result }); if (error) throw error }
export async function saveLessonProgress(supabase: SupabaseClient, userId: string, progress: LessonProgress) { const { error } = await supabase.from('lesson_progress').upsert({ user_id: userId, lesson_slug: progress.lessonSlug, status: progress.completedAt ? 'completed' : 'started', completed_at: progress.completedAt, updated_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_slug' }); if (error) throw error }
export async function recordDailyActivity(supabase: SupabaseClient, userId: string, minutes = 0) { const today = new Date().toISOString().slice(0, 10); const { data, error: readError } = await supabase.from('daily_activity').select('minutes,exercises').eq('user_id', userId).eq('activity_date', today).maybeSingle(); if (readError) throw readError; const { error } = await supabase.from('daily_activity').upsert({ user_id: userId, activity_date: today, minutes: (data?.minutes ?? 0) + minutes, exercises: (data?.exercises ?? 0) + 1 }, { onConflict: 'user_id,activity_date' }); if (error) throw error }
=======
import type { CefrLevel, DashboardData, LessonProgress, PlacementResult } from '@/types/learning'

type PlacementRow = {
  estimated_level: CefrLevel
  score: number
  total: number
  category_scores: PlacementResult['categoryScores'] | null
  recommended_lesson: string
  completed_at: string
}

type LessonRow = {
  lesson_slug: string
  started_at: string
  completed_at: string | null
  progress_percent: number | null
  last_position: number | null
  updated_at?: string
}

type GrammarAttemptRow = {
  grammar_topic: string | null
  is_correct: boolean
  attempted_at: string
}

type VocabularyRow = {
  next_review: string
  mastery: number | null
}

type ActivityRow = {
  activity_date: string
}

export async function loadDashboardData(supabase: SupabaseClient, userId: string): Promise<DashboardData> {
  const [placement, lessons, attempts, vocabulary, activity] = await Promise.all([
    supabase.from('placement_results').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('lesson_progress').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    supabase.from('exercise_attempts').select('grammar_topic,is_correct,attempted_at').eq('user_id', userId).order('attempted_at', { ascending: false }).limit(100),
    supabase.from('vocabulary_progress').select('*').eq('user_id', userId),
    supabase.from('daily_activity').select('activity_date').eq('user_id', userId).order('activity_date', { ascending: false }).limit(14),
  ])

  const errors = [placement.error, lessons.error, attempts.error, vocabulary.error, activity.error].filter(Boolean)
  if (errors.length) throw errors[0]

  const attemptRows = (attempts.data ?? []) as GrammarAttemptRow[]
  const lessonRows = (lessons.data ?? []) as LessonRow[]
  const vocabularyRows = (vocabulary.data ?? []) as VocabularyRow[]
  const activityRows = (activity.data ?? []) as ActivityRow[]
  const placementRow = placement.data as PlacementRow | null

  const counts = new Map<string, { wrong: number; total: number }>()
  for (const attempt of attemptRows) {
    if (!attempt.grammar_topic) continue
    const entry = counts.get(attempt.grammar_topic) ?? { wrong: 0, total: 0 }
    entry.total += 1
    if (!attempt.is_correct) entry.wrong += 1
    counts.set(attempt.grammar_topic, entry)
  }

  const weakGrammarTopics = [...counts.entries()]
    .filter(([, value]) => value.total >= 1 && value.wrong / value.total >= 0.4)
    .sort((a, b) => (b[1].wrong / b[1].total) - (a[1].wrong / a[1].total))
    .map(([topic]) => topic)
    .slice(0, 3)

  const now = Date.now()
  const unfinishedLesson = lessonRows.find((lesson) => !lesson.completed_at)
  const currentLessonRow = unfinishedLesson ?? lessonRows[0] ?? null

  return {
    placementResult: placementRow
      ? {
          estimatedLevel: placementRow.estimated_level,
          score: placementRow.score,
          total: placementRow.total,
          categoryScores: placementRow.category_scores ?? {},
          recommendedLesson: placementRow.recommended_lesson,
          completedAt: placementRow.completed_at,
        }
      : null,
    currentLesson: currentLessonRow ? mapLesson(currentLessonRow) : null,
    weakGrammarTopics,
    dueVocabulary: vocabularyRows.filter((item) => new Date(item.next_review).getTime() <= now).length,
    masteredVocabulary: vocabularyRows.filter((item) => (item.mastery ?? 0) >= 70).length,
    completedLessons: lessonRows.filter((lesson) => Boolean(lesson.completed_at)).length,
    recentActivityCount: activityRows.length,
  }
}

function mapLesson(row: LessonRow): LessonProgress {
  return {
    lessonSlug: row.lesson_slug,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    progressPercent: row.progress_percent ?? 0,
    lastPosition: row.last_position ?? 0,
  }
}

export async function savePlacementResult(supabase: SupabaseClient, userId: string, result: PlacementResult) {
  const { error } = await supabase.from('placement_results').insert({
    user_id: userId,
    estimated_level: result.estimatedLevel,
    score: result.score,
    total: result.total,
    category_scores: result.categoryScores,
    recommended_lesson: result.recommendedLesson,
    completed_at: result.completedAt,
  })
  if (error) throw error
}

export async function saveLessonProgress(supabase: SupabaseClient, userId: string, progress: LessonProgress) {
  const { error } = await supabase.from('lesson_progress').upsert({
    user_id: userId,
    lesson_slug: progress.lessonSlug,
    started_at: progress.startedAt,
    completed_at: progress.completedAt,
    progress_percent: progress.progressPercent,
    last_position: progress.lastPosition,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,lesson_slug' })
  if (error) throw error
}

export async function recordDailyActivity(supabase: SupabaseClient, userId: string) {
  const activityDate = new Date().toISOString().slice(0, 10)
  const { data, error: readError } = await supabase.from('daily_activity').select('exercises,minutes').eq('user_id', userId).eq('activity_date', activityDate).maybeSingle()
  if (readError) throw readError
  const { error } = await supabase.from('daily_activity').upsert({
    user_id: userId,
    activity_date: activityDate,
    exercises: (data?.exercises ?? 0) + 1,
    minutes: data?.minutes ?? 0,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,activity_date' })
  if (error) throw error
}

export async function saveUserProgress(supabase: SupabaseClient, userId: string, currentLevel: string | null, currentLesson: string | null) {
  const { error } = await supabase.from('user_progress').upsert({
    user_id: userId,
    current_level: currentLevel,
    current_lesson: currentLesson,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  if (error) throw error
}
>>>>>>> 00f644f1c2a426f01c3118904d420b007f2001d9
