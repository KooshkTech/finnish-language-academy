'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LevelNav } from './LevelNav'
import { Blackboard } from './Blackboard'
import { AssessmentReportCard } from './AssessmentReportCard'
import { InlineDictionaryText } from '@/components/dictionary/InlineDictionaryText'
import { LevelResources } from './LevelResources'
import { UniversalTools } from './UniversalTools'
import { SpeakingConversationLab } from './SpeakingConversationLab'
import { InteractiveQALoop } from './InteractiveQALoop'
import { LessonProgressTracker } from './LessonProgressTracker'
import { buildQAQuestions } from '@/data/qa-sessions'
import type { LearningLevelId } from '@/data/levels'
import type { SkillModule } from '@/types/classroom'
import { saveAssessmentResult } from '@/services/client-assessment-progress'
import { AddToReviewButton } from '@/components/review/AddToReviewButton'

const tabs = ['Opi', 'Harjoittele', 'Muistikortit', 'Testi'] as const
type Tab = typeof tabs[number]

export function LevelSkillClassroom({ level, module }: { level: string; module: SkillModule }) {
  const levelId = level.toLowerCase() as LearningLevelId
  const [tab, setTab] = useState<Tab>('Opi')
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number,string>>({})
  const [flipped, setFlipped] = useState<Record<number,boolean>>({})
  const qaQuestions = buildQAQuestions(levelId, module)

  return <div className="level-classroom-shell">
    <LevelNav level={level}/>
    <main className="level-classroom-main">
      <header className="level-classroom-header">
        <div><p className="eyebrow">TASO {level.toUpperCase()} · {module.title}</p><h1>{module.title}</h1><p>{module.subtitle}</p></div>
        <Link className="level-home-link" href={`/levels/${level.toLowerCase()}`}>← Tason pääsivu</Link>
      </header>
      <LessonProgressTracker language="fi" level={level} skill={module.route} progressLabel="Oppitunnin edistyminen" completeActionLabel="Merkitse oppitunti valmiiksi" completedLabel="Oppitunti valmis" guestNote="Vapaa käyttö · tallennus tällä laitteella" signedInNote="Tallennetaan opiskelijatilillesi"/>
      <UniversalTools title={`${level.toUpperCase()} · ${module.title}`} flashcards={module.flashcards}/>
      {module.route === '/speaking' && <SpeakingConversationLab level={levelId}/>}
      {['/speaking','/listening','/reading','/writing','/understanding','/vocabulary'].includes(module.route) && <InteractiveQALoop questions={qaQuestions} title={`${level.toUpperCase()} · ${module.title} · kysymykset`}/>}
      <div className="level-tabs" role="tablist">{tabs.map(item => <button key={item} role="tab" aria-selected={tab===item} onClick={()=>setTab(item)}>{item}</button>)}</div>
      <div className="level-lesson-grid">
        <section className="level-workspace">
          {tab === 'Opi' && <div className="module-panel"><h2>Tämän oppitunnin tavoite</h2>{module.learn.map(item => <p key={item}>• {item}</p>)}<div className="example-stack">{module.examples.map((example,index)=><div key={index}><strong><InlineDictionaryText text={example.source}/></strong><span>{example.target}</span>{example.note && <small>{example.note}</small>}</div>)}</div></div>}
          {tab === 'Harjoittele' && <div className="module-panel"><h2>Harjoittele</h2>{(module.practice ?? module.test).map((q,index)=><div className="practice-question" key={q.question}><strong>{q.question}</strong><div>{q.options.map(option=><button key={option} className={practiceAnswers[index]===option?'selected':''} onClick={()=>setPracticeAnswers(current=>({...current,[index]:option}))}>{option}</button>)}</div>{practiceAnswers[index] && <p className={practiceAnswers[index]===q.answer?'good':'bad'}>{practiceAnswers[index]===q.answer?'Oikein. ':'Ei vielä. '}{q.explanation}</p>}</div>)}</div>}
          {tab === 'Muistikortit' && <div className="module-panel"><h2>Muistikortit</h2><div className="flashcard-grid">{module.flashcards.map((card,index)=><div className="flashcard-review-wrap" key={card.front}><button className="topic-flashcard" onClick={()=>setFlipped(current=>({...current,[index]:!current[index]}))}><small>{flipped[index]?'VASTAUS':'KYSYMYS'}</small><strong>{flipped[index]?card.back:card.front}</strong><span>Käännä kortti</span></button><AddToReviewButton language="fi" word={card.front} meaning={card.back}/></div>)}</div></div>}
          {tab === 'Testi' && <div className="module-panel"><h2>{level.toUpperCase()} · {module.title} testi</h2><p>Testi vastaa tämän oppitunnin sisältöä. Harjoitustulos ei ole virallinen CEFR- tai YKI-arvio.</p><AssessmentReportCard title={`${level.toUpperCase()} · ${module.title}`} questions={module.test} onSubmitted={async (answers)=>{await saveAssessmentResult({ language: 'fi', level, skill: module.route, questions: module.test, answers })}}/></div>}
        </section>
        <Blackboard blocks={module.blackboard} storageKey={`opiope-board-${level.toLowerCase()}-${module.route.replace(/\//g, '')}`}/>
      </div>
      <LevelResources level={levelId}/>
    </main>
  </div>
}

