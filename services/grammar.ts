import type { SupabaseClient } from '@supabase/supabase-js'
import type { GrammarAttempt } from '@/types/learning'

export async function saveGrammarAttempt(supabase: SupabaseClient, userId: string, attempt: GrammarAttempt) {
  const { error } = await supabase.from('exercise_attempts').insert({ user_id: userId, lesson_slug: 'grammar-basics', exercise_id: attempt.exerciseId, grammar_topic: attempt.topic, answer: attempt.selectedAnswer, is_correct: attempt.isCorrect, attempted_at: attempt.attemptedAt })
  if (error) throw error
}
