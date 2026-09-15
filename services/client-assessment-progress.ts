'use client'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { loadGuestState, saveGuestState } from '@/services/guest-progress'
import { recordDailyActivity, saveLessonProgress, saveUserProgress } from '@/services/progress'
import type { LearningLanguage, LessonProgress } from '@/types/learning'

type Question = { question: string; answer: string; explanation: string }

type SaveAssessmentArgs = {
  language: LearningLanguage
  level: string
  skill: string
  questions: Question[]
  answers: Record<number, string>
}

function slugOf(language: LearningLanguage, level: string, skill: string) {
  return `${language}:${level.toLowerCase()}:${skill.replace(/^\//, '')}`
}

export async function saveAssessmentResult({ language, level, skill, questions, answers }: SaveAssessmentArgs) {
  const slug = slugOf(language, level, skill)
  const now = new Date().toISOString()
  const attempts = questions.map((question, index) => ({
    exerciseId: `test-${index + 1}`,
    topic: skill.replace(/^\//, ''),
    selectedAnswer: answers[index] ?? '',
    isCorrect: answers[index] === question.answer,
    attemptedAt: now,
    explanation: question.explanation,
    questionText: question.question,
    correctAnswer: question.answer,
    language,
    lessonSlug: slug,
  }))
  const correct = attempts.filter(item => item.isCorrect).length
  const percentage = questions.length ? Math.round((correct / questions.length) * 100) : 0

  if (!isSupabaseConfigured()) {
    const state = loadGuestState()
    const current = state.lessonProgress[slug]
    const lesson: LessonProgress = {
      lessonSlug: slug,
      startedAt: current?.startedAt ?? now,
      completedAt: current?.completedAt ?? null,
      progressPercent: Math.max(current?.progressPercent ?? 0, 90),
      lastPosition: percentage,
    }
    saveGuestState({
      ...state,
      lessonProgress: { ...state.lessonProgress, [slug]: lesson },
      grammarAttempts: [...state.grammarAttempts, ...attempts.map(item => ({ exerciseId: item.exerciseId, topic: item.topic, selectedAnswer: item.selectedAnswer, isCorrect: item.isCorrect, attemptedAt: item.attemptedAt, language: item.language, lessonSlug: item.lessonSlug, questionText: item.questionText, correctAnswer: item.correctAnswer, explanation: item.explanation }))].slice(-300),
    })
    return { percentage, signedIn: false }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const state = loadGuestState()
    const current = state.lessonProgress[slug]
    const lesson: LessonProgress = {
      lessonSlug: slug,
      startedAt: current?.startedAt ?? now,
      completedAt: current?.completedAt ?? null,
      progressPercent: Math.max(current?.progressPercent ?? 0, 90),
      lastPosition: percentage,
    }
    saveGuestState({
      ...state,
      lessonProgress: { ...state.lessonProgress, [slug]: lesson },
      grammarAttempts: [...state.grammarAttempts, ...attempts.map(item => ({ exerciseId: item.exerciseId, topic: item.topic, selectedAnswer: item.selectedAnswer, isCorrect: item.isCorrect, attemptedAt: item.attemptedAt, language: item.language, lessonSlug: item.lessonSlug, questionText: item.questionText, correctAnswer: item.correctAnswer, explanation: item.explanation }))].slice(-300),
    })
    return { percentage, signedIn: false }
  }

  const { data: current } = await supabase
    .from('lesson_progress')
    .select('started_at,completed_at,progress_percent')
    .eq('user_id', user.id)
    .eq('lesson_slug', slug)
    .maybeSingle()

  const lesson: LessonProgress = {
    lessonSlug: slug,
    startedAt: current?.started_at ?? now,
    completedAt: current?.completed_at ?? null,
    progressPercent: Math.max(current?.progress_percent ?? 0, 90),
    lastPosition: percentage,
  }

  const rows = questions.map((question, index) => ({
    user_id: user.id,
    lesson_slug: slug,
    exercise_id: `test-${index + 1}`,
    grammar_topic: skill.replace(/^\//, ''),
    answer: answers[index] ?? '',
    is_correct: answers[index] === question.answer,
    explanation: question.explanation,
    learning_language: language,
    question_text: question.question,
    correct_answer: question.answer,
    attempted_at: now,
  }))

  const { error: attemptError } = await supabase.from('exercise_attempts').insert(rows)
  if (attemptError) throw attemptError
  await Promise.all([
    saveLessonProgress(supabase, user.id, lesson),
    saveUserProgress(supabase, user.id, level.toUpperCase(), slug),
    recordDailyActivity(supabase, user.id),
  ])

  return { percentage, signedIn: true }
}

