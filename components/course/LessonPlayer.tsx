'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert } from 'lucide-react'
import type { CourseLesson, LessonAttemptResult } from '@/types/course'
import { canCompleteLesson, evaluateExercise, lessonCompletionPercent, lessonScore } from '@/services/course-engine'

type Props = { lesson: CourseLesson; courseId: string }

export default function LessonPlayer({ lesson, courseId }: Props) {
  const [activityIndex, setActivityIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<LessonAttemptResult[]>([])
  const [completed, setCompleted] = useState(false)
  const activity = lesson.activities[activityIndex]
  const exercises = useMemo(() => activity.exerciseIds.map(id => lesson.exercises.find(item => item.id === id)).filter(Boolean), [activity.exerciseIds, lesson.exercises])
  const progress = lessonCompletionPercent(lesson, results)
  const score = lessonScore(results)

  function submit(exerciseId: string) {
    const exercise = lesson.exercises.find(item => item.id === exerciseId)
    if (!exercise) return
    const answer = answers[exerciseId] ?? ''
    const next = evaluateExercise(exercise, answer)
    setResults(current => [...current.filter(item => item.exerciseId !== exerciseId), next])
  }

  function resultFor(id: string) {
    return results.find(item => item.exerciseId === id)
  }

  return <main className="course-page lesson-player-page">
    <div className="course-page-inner">
      <div className="lesson-topbar">
        <Link className="back-link" href={`/courses/${courseId}`}><ArrowLeft size={16}/> Kurssiin</Link>
        <div className="lesson-meter" aria-label={`Oppitunnin eteneminen ${progress} prosenttia`}><span style={{ width: `${progress}%` }} /></div>
        <span className="lesson-score">{score} XP</span>
      </div>

      <header className="course-hero compact-course-hero">
        <p className="eyebrow">OPPITUNTI · {activityIndex + 1}/{lesson.activities.length}</p>
        <h1>{lesson.title}</h1>
        <p>{lesson.objective}</p>
      </header>

      <section className="lesson-stage-card">
        <div className="lesson-stage-head">
          <div><span className="preview-badge">{activity.kind.toUpperCase()}</span><h2>{activity.title}</h2></div>
          <span>{lesson.estimatedMinutes} min</span>
        </div>
        <p className="lesson-stage-copy">{activity.content}</p>

        {exercises.length > 0 && <div className="engine-exercises">
          {exercises.map(exercise => {
            if (!exercise) return null
            const result = resultFor(exercise.id)
            return <article className="engine-exercise" key={exercise.id}>
              <p className="modal-label">{exercise.skill.toUpperCase()} · {exercise.points} XP</p>
              <h3>{exercise.prompt}</h3>
              {exercise.options ? <div className="answer-list">
                {exercise.options.map(option => <button key={option} className={answers[exercise.id] === option ? 'selected' : ''} onClick={() => setAnswers(current => ({ ...current, [exercise.id]: option }))}>{option}</button>)}
              </div> : <input className="large-input" value={answers[exercise.id] ?? ''} onChange={event => setAnswers(current => ({ ...current, [exercise.id]: event.target.value }))} placeholder="Kirjoita vastaus" />}
              <div className="engine-exercise-actions">
                {exercise.hint && <span className="engine-hint">Vihje: {exercise.hint}</span>}
                <button className="outline-button" onClick={() => submit(exercise.id)} disabled={!answers[exercise.id]?.trim()}>Tarkista</button>
              </div>
              {result && <div className={`feedback ${result.isCorrect ? '' : 'feedback-error'}`}>{result.isCorrect ? <CheckCircle2 size={17}/> : <CircleAlert size={17}/>}<span><strong>{result.isCorrect ? 'Oikein.' : 'Ei vielä.'}</strong> {result.explanation}</span></div>}
            </article>
          })}
        </div>}
      </section>

      <div className="lesson-navigation">
        <button className="outline-button" disabled={activityIndex === 0} onClick={() => setActivityIndex(index => Math.max(0, index - 1))}><ArrowLeft size={16}/> Edellinen</button>
        {activityIndex < lesson.activities.length - 1 ? <button className="primary-button" onClick={() => setActivityIndex(index => Math.min(lesson.activities.length - 1, index + 1))}>Seuraava <ArrowRight size={16}/></button> : <button className="primary-button" disabled={!canCompleteLesson(lesson, results)} onClick={() => setCompleted(true)}>Suorita oppitunti <CheckCircle2 size={16}/></button>}
      </div>

      {!canCompleteLesson(lesson, results) && activityIndex === lesson.activities.length - 1 && <p className="lesson-requirement">Suorita kaikki pakolliset tehtävät oikein ennen oppitunnin valmistumista. Tämä estää keinotekoisen “valmis”-tilan.</p>}
      {completed && <div className="lesson-complete-panel"><CheckCircle2 size={28}/><div><strong>Oppitunti valmis</strong><p>Kaikki vaaditut tehtävät on suoritettu. Tässä guest-versiossa tulos ei teeskentele palvelintallennusta; tilipersistenssi liitetään kurssimoottorin Supabase-tauluihin seuraavassa backend-vaiheessa.</p></div></div>}
    </div>
  </main>
}

