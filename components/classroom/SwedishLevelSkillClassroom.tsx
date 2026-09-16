'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Blackboard } from './Blackboard'
import { LessonProgressTracker } from './LessonProgressTracker'
import type { SkillModule } from '@/types/classroom'
import { saveAssessmentResult } from '@/services/client-assessment-progress'
import { AddToReviewButton } from '@/components/review/AddToReviewButton'

const tabs = ['Lär dig', 'Öva', 'Minneskort', 'Test'] as const
type Tab = typeof tabs[number]

export function SwedishLevelSkillClassroom({ level, module }: { level: string; module: SkillModule }) {
  const [tab, setTab] = useState<Tab>('Lär dig')
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const testCorrect = module.test.filter((q, index) => answers[index] === q.answer).length

  return <div className="level-classroom-shell">
    <aside className="level-sidebar">
      <Link className="brand-mini" href="/">OpiOpe</Link>
      <div className="selected-level-card"><small>VALD NIVÅ</small><strong>{level.toUpperCase()}</strong></div>
      <nav className="level-side-nav" aria-label="Svenska färdigheter">
        <Link href={`/course/sv/levels/${level.toLowerCase()}`}>Nivåns startsida</Link>
        <Link href={`/course/sv/levels/${level.toLowerCase()}/listening`}>Lyssna</Link>
        <Link href={`/course/sv/levels/${level.toLowerCase()}/reading`}>Läsa</Link>
        <Link href={`/course/sv/levels/${level.toLowerCase()}/writing`}>Skriva</Link>
        <Link href={`/course/sv/levels/${level.toLowerCase()}/understanding`}>Grammatik</Link>
        <Link href={`/course/sv/levels/${level.toLowerCase()}/vocabulary`}>Ordförråd</Link>
        <Link href={`/course/sv/levels/${level.toLowerCase()}/speaking`}>Tala</Link>
      </nav>
    </aside>

    <main className="level-classroom-main">
      <header className="level-classroom-header">
        <div><p className="eyebrow">SVENSKA · NIVÅ {level.toUpperCase()}</p><h1>{module.title}</h1><p>{module.subtitle}</p></div>
        <Link className="level-home-link" href={`/course/sv/levels/${level.toLowerCase()}`}>← Nivåns startsida</Link>
      </header>

      <LessonProgressTracker language="sv" level={level} skill={module.route} progressLabel="Lektionens framsteg" completeActionLabel="Markera lektionen som klar" completedLabel="Lektionen är klar" guestNote="Fri användare · sparas på denna enhet" signedInNote="Sparas på ditt studentkonto"/>

      <div className="level-tabs" role="tablist">{tabs.map(item => <button key={item} role="tab" aria-selected={tab === item} onClick={() => { setTab(item); setSubmitted(false) }}>{item}</button>)}</div>
      <div className="level-lesson-grid">
        <section className="level-workspace">
          {tab === 'Lär dig' && <div className="module-panel"><h2>Lektionens mål</h2>{module.learn.map(item => <p key={item}>• {item}</p>)}<div className="example-stack">{module.examples.map((example, index) => <div key={index}><strong>{example.source}</strong><span>{example.target}</span>{example.note && <small>{example.note}</small>}</div>)}</div></div>}

          {tab === 'Öva' && <div className="module-panel"><h2>Öva</h2>{(module.practice ?? module.test).map((q, index) => <div className="practice-question" key={q.question}><strong>{q.question}</strong><div>{q.options.map(option => <button key={option} className={answers[index] === option ? 'selected' : ''} onClick={() => setAnswers(current => ({ ...current, [index]: option }))}>{option}</button>)}</div>{answers[index] && <p className={answers[index] === q.answer ? 'good' : 'bad'}>{answers[index] === q.answer ? 'Rätt. ' : 'Försök igen. '}{q.explanation}</p>}</div>)}</div>}

          {tab === 'Minneskort' && <div className="module-panel"><h2>Minneskort</h2><div className="flashcard-grid">{module.flashcards.map((card, index) => <div className="flashcard-review-wrap" key={`${card.front}-${index}`}><button className="topic-flashcard" onClick={() => setFlipped(current => ({ ...current, [index]: !current[index] }))}><small>{flipped[index] ? 'SVAR' : 'ORD'}</small><strong>{flipped[index] ? card.back : card.front}</strong><span>Vänd kortet</span></button><AddToReviewButton language="sv" word={card.front} meaning={card.back}/></div>)}</div></div>}

          {tab === 'Test' && <div className="module-panel"><h2>{level.toUpperCase()} · test</h2><p>Det här är en övningsbedömning och inte ett officiellt CEFR-resultat.</p>{module.test.map((q, index) => <div className="practice-question" key={q.question}><strong>{index + 1}. {q.question}</strong><div>{q.options.map(option => <button key={option} disabled={submitted} className={answers[index] === option ? 'selected' : ''} onClick={() => setAnswers(current => ({ ...current, [index]: option }))}>{option}</button>)}</div>{submitted && <p className={answers[index] === q.answer ? 'good' : 'bad'}>{answers[index] === q.answer ? 'Rätt. ' : `Rätt svar: ${q.answer}. `}{q.explanation}</p>}</div>)}{!submitted ? <button className="primary-action" disabled={Object.keys(answers).length < module.test.length} onClick={() => { setSubmitted(true); void saveAssessmentResult({ language: 'sv', level, skill: module.route, questions: module.test, answers }) }}>Bedöm testet</button> : <div className="report-card"><p><strong>{testCorrect}/{module.test.length}</strong> rätt</p><p>OpiOpe övningsbedömning — inte ett officiellt CEFR-resultat.</p></div>}</div>}
        </section>
        <Blackboard language="sv" blocks={module.blackboard} storageKey={`opiope-board-sv-${level.toLowerCase()}-${module.route.replace(/\//g, '')}`}/>
      </div>
    </main>
  </div>
}

