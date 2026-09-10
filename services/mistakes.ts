import type { SupabaseClient } from '@supabase/supabase-js'

export type MistakeCategory = 'grammar' | 'vocabulary' | 'spelling' | 'word-order' | 'case' | 'verb' | 'listening' | 'writing'
export type LearnerMistake = { userId: string; exerciseId: string; lessonSlug: string; category: MistakeCategory; prompt: string; answer: string; expectedAnswer: string; explanation: string; resolved: boolean; createdAt: string }

export async function recordMistake(supabase: SupabaseClient, mistake: Omit<LearnerMistake, 'userId' | 'createdAt' | 'resolved'> & { userId: string }) {
  const { error } = await supabase.from('learner_mistakes').insert({ user_id: mistake.userId, exercise_id: mistake.exerciseId, lesson_slug: mistake.lessonSlug, category: mistake.category, prompt: mistake.prompt, answer: mistake.answer, expected_answer: mistake.expectedAnswer, explanation: mistake.explanation, resolved: false })
  if (error) throw error
}

export async function resolveMistake(supabase: SupabaseClient, userId: string, mistakeId: string) {
  const { error } = await supabase.from('learner_mistakes').update({ resolved: true, resolved_at: new Date().toISOString() }).eq('id', mistakeId).eq('user_id', userId)
  if (error) throw error
}

export async function loadOpenMistakes(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.from('learner_mistakes').select('*').eq('user_id', userId).eq('resolved', false).order('created_at', { ascending: false }).limit(50)
  if (error) throw error
  return data ?? []
}
