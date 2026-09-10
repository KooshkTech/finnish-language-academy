'use client'

import { useState } from 'react'
import { Check, Lightbulb, RotateCcw } from 'lucide-react'
import type { Exercise } from '@/data/curriculum'

type ExerciseCardProps = { exercise: Exercise; onComplete?: (correct: boolean) => void }

export function ExerciseCard({ exercise, onComplete }: ExerciseCardProps) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const correct = submitted && answer.trim().toLocaleLowerCase() === exercise.answer?.trim().toLocaleLowerCase()
  const isChoice = exercise.type === 'multiple-choice'

  function submit() {
    if (!answer.trim()) return
    setSubmitted(true)
    onComplete?.(answer.trim().toLocaleLowerCase() === exercise.answer?.trim().toLocaleLowerCase())
  }

  function reset() { setAnswer(''); setSubmitted(false) }

  return <article className="practice-card" aria-labelledby={`exercise-${exercise.id}`}>
    <div className="practice-top"><span className="modal-label">{exercise.skill.toUpperCase()}</span><span>{exercise.type}</span></div>
    <h3 id={`exercise-${exercise.id}`}>{exercise.prompt}</h3>
    {isChoice && <div className="answer-list">{exercise.options?.map(option => <button key={option} className={answer === option ? 'selected' : ''} onClick={() => setAnswer(option)} disabled={submitted}>{option}</button>)}</div>}
    {!isChoice && <input className="large-input" value={answer} onChange={event => setAnswer(event.target.value)} disabled={submitted} aria-label="Vastaus" />}
    <div className="row"><button className="primary-button" onClick={submit} disabled={!answer.trim() || submitted}><Check size={15} /> Tarkista</button>{submitted && <button className="outline-button" onClick={reset}><RotateCcw size={15} /> Yritä uudelleen</button>}</div>
    {submitted && <div className={`feedback ${correct ? 'correct' : 'incorrect'}`} role="status"><strong>{correct ? 'Oikein.' : 'Hyvä yritys.'}</strong> {correct ? exercise.explanation : `Oikea vastaus: ${exercise.answer ?? '—'}. ${exercise.explanation}`} {!correct && <Lightbulb size={16} aria-hidden="true" />}</div>}
  </article>
}
