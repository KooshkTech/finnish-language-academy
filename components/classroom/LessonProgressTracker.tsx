'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { loadGuestState, saveGuestState } from '@/services/guest-progress'
import { recordDailyActivity, saveLessonProgress, saveUserProgress } from '@/services/progress'
import type { LearningLanguage, LessonProgress } from '@/types/learning'

type Props = {
  language: LearningLanguage
  level: string
  skill: string
  completedLabel: string
  completeActionLabel: string
  progressLabel: string
  guestNote: string
  signedInNote: string
}

function lessonSlug(language: LearningLanguage, level: string, skill: string) {
  return `${language}:${level.toLowerCase()}:${skill.replace(/^\//, '')}`
}

export function LessonProgressTracker({
  language,
  level,
  skill,
  completedLabel,
  completeActionLabel,
  progressLabel,
  guestNote,
  signedInNote,
}: Props) {
  const supabase = useMemo(() => createClient(), [])
  const slug = useMemo(() => lessonSlug(language, level, skill), [language, level, skill])
  const [progress, setProgress] = useState(10)
  const [completed, setCompleted] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [status, setStatus] = useState('')

  const saveLocal = useCallback((nextProgress: number, done: boolean) => {
    const state = loadGuestState()
    const now = new Date().toISOString()
    const existing = state.lessonProgress[slug]
    const next: LessonProgress = {
      lessonSlug: slug,
      startedAt: existing?.startedAt ?? now,
      completedAt: done ? (existing?.completedAt ?? now) : null,
      progressPercent: Math.max(existing?.progressPercent ?? 0, nextProgress),
      lastPosition: Math.max(existing?.lastPosition ?? 0, nextProgress),
    }
    saveGuestState({ ...state, lessonProgress: { ...state.lessonProgress, [slug]: next } })
    setProgress(next.progressPercent)
    setCompleted(Boolean(next.completedAt))
  }, [slug])

  const persist = useCallback(async (nextProgress: number, done: boolean) => {
    const now = new Date().toISOString()
    if (!isSupabaseConfigured()) {
      saveLocal(nextProgress, done)
      setSignedIn(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      saveLocal(nextProgress, done)
      setSignedIn(false)
      return
    }

    setSignedIn(true)
    const { data: current } = await supabase
      .from('lesson_progress')
      .select('started_at,completed_at,progress_percent,last_position')
      .eq('user_id', user.id)
      .eq('lesson_slug', slug)
      .maybeSingle()

    const next: LessonProgress = {
      lessonSlug: slug,
      startedAt: current?.started_at ?? now,
      completedAt: done ? (current?.completed_at ?? now) : null,
      progressPercent: Math.max(current?.progress_percent ?? 0, nextProgress),
      lastPosition: Math.max(current?.last_position ?? 0, nextProgress),
    }

    await Promise.all([
      saveLessonProgress(supabase, user.id, next),
      saveUserProgress(supabase, user.id, level.toUpperCase(), slug),
      recordDailyActivity(supabase, user.id),
    ])

    setProgress(next.progressPercent)
    setCompleted(Boolean(next.completedAt))
  }, [level, saveLocal, slug, supabase])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        if (isSupabaseConfigured()) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data } = await supabase
              .from('lesson_progress')
              .select('completed_at,progress_percent')
              .eq('user_id', user.id)
              .eq('lesson_slug', slug)
              .maybeSingle()
            if (!active) return
            setSignedIn(true)
            setProgress(Math.max(10, data?.progress_percent ?? 10))
            setCompleted(Boolean(data?.completed_at))
            if (!data) await persist(10, false)
            return
          }
        }

        const local = loadGuestState().lessonProgress[slug]
        if (!active) return
        setSignedIn(false)
        setProgress(Math.max(10, local?.progressPercent ?? 10))
        setCompleted(Boolean(local?.completedAt))
        if (!local) saveLocal(10, false)
      } catch {
        if (active) setStatus(language === 'fi' ? 'Edistymistä ei voitu tallentaa juuri nyt.' : 'Framstegen kunde inte sparas just nu.')
      }
    }
    void load()
    return () => { active = false }
  }, [language, persist, saveLocal, slug, supabase])

  async function markComplete() {
    setStatus('')
    try {
      await persist(100, true)
      setStatus(completedLabel)
    } catch {
      setStatus(language === 'fi' ? 'Tallennus epäonnistui. Yritä uudelleen.' : 'Sparandet misslyckades. Försök igen.')
    }
  }

  return <section className="lesson-progress-card" aria-label={progressLabel}>
    <div className="lesson-progress-head">
      <div>
        <small>{progressLabel}</small>
        <strong>{progress}%</strong>
      </div>
      <span>{signedIn ? signedInNote : guestNote}</span>
    </div>
    <div className="lesson-progress-bar" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
    <button className="primary-action" type="button" disabled={completed} onClick={markComplete}>
      {completed ? completedLabel : completeActionLabel}
    </button>
    {status && <p className="lesson-progress-status" role="status">{status}</p>}
  </section>
}

