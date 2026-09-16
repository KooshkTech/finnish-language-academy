'use client'

import { useMemo, useState } from 'react'
import { Blackboard } from './Blackboard'
import { InteractiveQALoop } from './InteractiveQALoop'
import { getLevelSkillModule } from '@/data/level-curriculum'
import { learningLevels, type LearningLevelId, type LevelSkillSlug } from '@/data/levels'
import { buildQAQuestions } from '@/data/qa-sessions'

export function StandaloneQASkillPage({ skill }: { skill: Extract<LevelSkillSlug, 'speaking'|'listening'|'reading'|'writing'|'understanding'> }) {
  const [level, setLevel] = useState<LearningLevelId>('a1')
  const lessonModule = useMemo(() => getLevelSkillModule(level, skill), [level, skill])
  const questions = useMemo(() => buildQAQuestions(level, lessonModule), [level, lessonModule])
  return <main className="standalone-qa-page">
    <header className="classroom-header"><div><p className="eyebrow">OPIOPE · INTERACTIVE Q&A</p><h1>{lessonModule.title}</h1><p>{lessonModule.subtitle}</p></div></header>
    <div className="qa-level-picker" aria-label="Valitse taso">{learningLevels.map(item => <button key={item.id} type="button" aria-pressed={level===item.id} onClick={() => setLevel(item.id)}>{item.label}</button>)}</div>
    <div className="classroom-grid"><section className="lesson-workspace"><InteractiveQALoop questions={questions} title={`${level.toUpperCase()} · ${lessonModule.title}`}/></section><Blackboard blocks={lessonModule.blackboard} storageKey={`opiope-qa-${level}-${skill}`}/></div>
  </main>
}

