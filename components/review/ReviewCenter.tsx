'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { loadGuestState } from '@/services/guest-progress'
import { reviewWord } from '@/services/client-review'
import type { LearningLanguage, VocabularyProgress } from '@/types/learning'

type VocabItem = VocabularyProgress & { language: LearningLanguage }
type MistakeItem = {
  id: string
  language: LearningLanguage
  lessonSlug: string | null
  exerciseId: string
  questionText: string | null
  selectedAnswer: string | null
  correctAnswer: string | null
  explanation: string | null
  attemptedAt: string
}

function parseLessonHref(slug: string | null) {
  if (!slug) return null
  const [language, level, skill] = slug.split(':')
  if (!level || !skill) return null
  return language === 'sv' ? `/course/sv/levels/${level}/${skill}` : `/levels/${level}/${skill}`
}

function fromRow(row: Record<string, unknown>): VocabItem {
  return {
    language: row.learning_language === 'sv' ? 'sv' : 'fi',
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

export function ReviewCenter({ language }: { language: LearningLanguage }) {
  const fi = language === 'fi'
  const supabase = useMemo(() => createClient(), [])
  const [vocabulary, setVocabulary] = useState<VocabItem[]>([])
  const [mistakes, setMistakes] = useState<MistakeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setStatus('')
      try {
        if (isSupabaseConfigured()) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const [vocabResult, mistakesResult] = await Promise.all([
              supabase.from('vocabulary_progress').select('*').eq('user_id', user.id).eq('learning_language', language).order('next_review', { ascending: true }).limit(100),
              supabase.from('exercise_attempts').select('id,learning_language,lesson_slug,exercise_id,question_text,answer,correct_answer,explanation,attempted_at').eq('user_id', user.id).eq('is_correct', false).eq('learning_language', language).order('attempted_at', { ascending: false }).limit(30),
            ])
            if (vocabResult.error) throw vocabResult.error
            if (mistakesResult.error) throw mistakesResult.error
            if (!active) return
            setVocabulary((vocabResult.data ?? []).map(row => fromRow(row as Record<string, unknown>)))
            setMistakes((mistakesResult.data ?? []).map(row => ({
              id: String(row.id),
              language: row.learning_language === 'sv' ? 'sv' : 'fi',
              lessonSlug: row.lesson_slug,
              exerciseId: row.exercise_id,
              questionText: row.question_text,
              selectedAnswer: row.answer,
              correctAnswer: row.correct_answer,
              explanation: row.explanation,
              attemptedAt: row.attempted_at,
            })))
            return
          }
        }

        const state = loadGuestState()
        if (!active) return
        const localVocabulary = Object.entries(state.vocabularyProgress)
          .filter(([key]) => key.startsWith(`${language}:`) || (!key.includes(':') && language === 'fi'))
          .map(([, value]) => ({ ...value, language }))
        const localMistakes = state.grammarAttempts
          .filter(item => !item.isCorrect && (!item.language || item.language === language))
          .slice(-30)
          .reverse()
          .map((item, index) => ({
            id: `guest-${index}-${item.attemptedAt}`,
            language,
            lessonSlug: item.lessonSlug ?? null,
            exerciseId: item.exerciseId,
            questionText: item.questionText ?? null,
            selectedAnswer: item.selectedAnswer,
            correctAnswer: item.correctAnswer ?? null,
            explanation: item.explanation ?? null,
            attemptedAt: item.attemptedAt,
          }))
        setVocabulary(localVocabulary)
        setMistakes(localMistakes)
      } catch {
        if (active) setStatus(fi ? 'Kertausdataa ei voitu ladata. Tarkista Supabase-migraatio ja yhteys.' : 'Repetitionsdata kunde inte laddas. Kontrollera Supabase-migreringen och anslutningen.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [fi, language, supabase])

  const [now] = useState(() => Date.now())
  const due = vocabulary.filter(item => new Date(item.nextReview).getTime() <= now)
  const later = vocabulary.filter(item => new Date(item.nextReview).getTime() > now)

  async function mark(item: VocabItem, correct: boolean) {
    try {
      const next = await reviewWord(language, item.word, correct)
      if (!next) return
      setVocabulary(current => current.map(value => value.word === item.word ? { ...next, language } : value))
      setRevealed(current => ({ ...current, [item.word]: false }))
      setStatus(correct ? (fi ? 'Hyvä — seuraava kertaus siirrettiin myöhemmäksi.' : 'Bra — nästa repetition flyttades fram.') : (fi ? 'Sana palaa kertaukseen pian.' : 'Ordet kommer tillbaka snart.'))
    } catch {
      setStatus(fi ? 'Kertausta ei voitu tallentaa.' : 'Repetitionen kunde inte sparas.')
    }
  }

  return <div className="review-center">
    <section className="review-summary-grid">
      <article><small>{fi ? 'TÄNÄÄN' : 'I DAG'}</small><strong>{due.length}</strong><span>{fi ? 'sanaa kertaukseen' : 'ord att repetera'}</span></article>
      <article><small>{fi ? 'VIRHEET' : 'MISSTAG'}</small><strong>{mistakes.length}</strong><span>{fi ? 'viimeisintä harjoitusvirhettä' : 'senaste övningsmisstag'}</span></article>
      <article><small>{fi ? 'HALLUSSA' : 'BEHÄRSKAT'}</small><strong>{vocabulary.filter(item => item.mastery >= 70).length}</strong><span>{fi ? 'sanaa vähintään 70 %' : 'ord minst 70 %'}</span></article>
    </section>

    {status && <p className="review-status" role="status">{status}</p>}
    {loading ? <p>{fi ? 'Ladataan kertausta…' : 'Laddar repetition…'}</p> : <>
      <section className="review-section">
        <div className="review-section-head"><div><p className="eyebrow">SRS</p><h2>{fi ? 'Tämän päivän sanastokertaus' : 'Dagens ordförrådsrepetition'}</h2></div><span>{due.length}</span></div>
        {due.length ? <div className="review-card-grid">{due.map(item => <article className="review-vocab-card" key={`${item.language}:${item.word}`}>
          <small>{fi ? 'SANA' : 'ORD'}</small>
          <h3>{item.word}</h3>
          {revealed[item.word] ? <div className="review-answer"><p>{item.translation}</p><small>{fi ? `Hallinta ${item.mastery}% · väli ${item.interval} pv` : `Behärskning ${item.mastery}% · intervall ${item.interval} d`}</small></div> : <button type="button" onClick={() => setRevealed(current => ({ ...current, [item.word]: true }))}>{fi ? 'Näytä merkitys' : 'Visa betydelse'}</button>}
          {revealed[item.word] && <div className="review-rating"><button type="button" onClick={() => void mark(item, false)}>{fi ? 'En muistanut' : 'Jag mindes inte'}</button><button type="button" onClick={() => void mark(item, true)}>{fi ? 'Muistin ✓' : 'Jag mindes ✓'}</button></div>}
        </article>)}</div> : <p>{fi ? 'Ei erääntyneitä sanoja. Lisää sanoja oppituntien muistikorteista.' : 'Inga ord är förfallna. Lägg till ord från lektionernas minneskort.'}</p>}
        {later.length > 0 && <p className="review-next-note">{fi ? `Seuraavia myöhemmin: ${later.length}` : `Kommande senare: ${later.length}`}</p>}
      </section>

      <section className="review-section">
        <div className="review-section-head"><div><p className="eyebrow">{fi ? 'VIRHEISTÄ OPPIMINEN' : 'LÄR AV MISSTAG'}</p><h2>{fi ? 'Viimeisimmät virheet' : 'Senaste misstagen'}</h2></div><span>{mistakes.length}</span></div>
        {mistakes.length ? <div className="mistake-review-list">{mistakes.map(item => {
          const href = parseLessonHref(item.lessonSlug)
          return <article key={item.id} className="mistake-review-card">
            <div><small>{item.lessonSlug ?? item.exerciseId}</small><h3>{item.questionText ?? (fi ? 'Harjoituskysymys' : 'Övningsfråga')}</h3></div>
            {item.selectedAnswer && <p><b>{fi ? 'Vastauksesi:' : 'Ditt svar:'}</b> {item.selectedAnswer}</p>}
            {item.correctAnswer && <p className="good"><b>{fi ? 'Oikea vastaus:' : 'Rätt svar:'}</b> {item.correctAnswer}</p>}
            {item.explanation && <p>{item.explanation}</p>}
            {href && <Link href={href}>{fi ? 'Palaa oppitunnille →' : 'Tillbaka till lektionen →'}</Link>}
          </article>
        })}</div> : <p>{fi ? 'Ei tallennettuja virheitä vielä.' : 'Inga sparade misstag ännu.'}</p>}
      </section>
    </>}
  </div>
}

