'use client'
import { useMemo, useState } from 'react'
import { ClassroomNav } from './ClassroomNav'
import { Blackboard } from './Blackboard'
import { UniversalTools } from './UniversalTools'
import { LearningProfileSwitcher } from './LearningProfileSwitcher'
import { AssessmentReportCard } from './AssessmentReportCard'
import { InteractiveQALoop } from './InteractiveQALoop'
import { buildVoiceLabQuestions } from '@/data/qa-sessions'
import { learningLevels, type LearningLevelId } from '@/data/levels'

const tabs=['Kysymys–vastaus','Opi','Muistikortit','Testi'] as const
type Tab=typeof tabs[number]
const cards=[{front:'tuli',back:'lyhyt u · palamisen liekki'},{front:'tuuli',back:'pitkä uu · ilman liike'},{front:'mato',back:'lyhyt t'},{front:'matto',back:'pitkä tt'}]
const questions=[
 {question:'Mikä sanapari osoittaa suomen kielen vokaalin pituuseron?',options:['tuli / tuuli','talo / talo','minä / sinä'],answer:'tuli / tuuli',explanation:'Suomen kielessä vokaalin pituus voi muuttaa sanan merkityksen.',dictionaryHeadwords:['tuli']},
 {question:'Miten pelkkää puheentunnistuksen tekstivastausta tulee tulkita?',options:['Se todistaa syntyperäisen ääntämisen.','Se näyttää tunnistetut sanat, ei täydellistä ääntämisarviota.','Se on virallinen CEFR-arvio.'],answer:'Se näyttää tunnistetut sanat, ei täydellistä ääntämisarviota.',explanation:'Pelkkä puheesta tekstiksi -tulos ei riitä luotettavaan foneemi- tai sävelkorkeusarviointiin.'},
]
export function VoiceLabClassroom(){
  const[tab,setTab]=useState<Tab>('Kysymys–vastaus')
  const[level,setLevel]=useState<LearningLevelId>('a1')
  const qaQuestions=useMemo(()=>buildVoiceLabQuestions(level),[level])
  return <div className="classroom-shell"><ClassroomNav/><main className="classroom-main"><header className="classroom-header"><div><p className="eyebrow">ÄÄNI · SUOMI / RUOTSI</p><h1>Äänilaboratorio</h1><p>Harjoittele kysymys–vastaus-tehtäviä, äänitystä, kuuntelua ja palvelinpohjaista puheentunnistusta. Foneemi- tai sävelkorkeuspisteitä näytetään vain, jos käytössä on oikea äänenanalyysipalvelu.</p></div></header><LearningProfileSwitcher/><UniversalTools title="Äänilaboratorio" flashcards={cards}/>
  <div className="qa-level-picker" aria-label="Valitse äänilaboratorion taso">{learningLevels.map(item=><button key={item.id} type="button" aria-pressed={level===item.id} onClick={()=>setLevel(item.id)}>{item.label}</button>)}</div>
  <div className="classroom-tabs" role="tablist">{tabs.map(item=><button key={item} role="tab" aria-selected={tab===item} onClick={()=>setTab(item)}>{item}</button>)}</div>
  {tab==='Kysymys–vastaus'&&<div className="classroom-grid"><section className="lesson-workspace"><InteractiveQALoop questions={qaQuestions} title={`${level.toUpperCase()} · puheharjoitus`}/></section><Blackboard blocks={[{type:'note',title:'Puheharjoitus',body:'Kuuntele kysymys, vastaa mikrofonilla, tarkista transkriptio ja siirrä palaute Blackboardille.'},{type:'compare',title:'Rekisteri',leftLabel:'Kirjakieli',left:'Minä söin puuroa.',rightLabel:'Puhekieli',right:'Mä söin puuroo.'}]} storageKey={`opiope-voice-qa-${level}`}/></div>}
  {tab==='Opi'&&<div className="classroom-grid"><section className="module-panel"><h2>Äänteen pituus suomen kielessä</h2><p>Suomi erottaa lyhyet ja pitkät vokaalit sekä konsonantit. Kuuntele ensin ero, äänitä sitten oma puheesi ja vertaa lopuksi ääntä sekä puheentunnistuksen tekstiä.</p><div className="example-stack"><div><strong>tuli</strong><span>lyhyt u</span></div><div><strong>tuuli</strong><span>pitkä uu</span></div></div></section><Blackboard blocks={[{type:'compare',title:'Vokaalin pituus',leftLabel:'Lyhyt',left:'tuli',rightLabel:'Pitkä',right:'tuuli'}]}/></div>}
  {tab==='Muistikortit'&&<div className="module-panel"><h2>Äännekortit</h2><div className="flashcard-grid">{cards.map(card=><article className="topic-flashcard" key={card.front}><small>ÄÄNNE</small><strong>{card.front}</strong><span>{card.back}</span></article>)}</div></div>}
  {tab==='Testi'&&<div className="module-panel"><h2>Ääntämisen ja puheen testi</h2><AssessmentReportCard title="Äänilaboratorio" questions={questions}/></div>}</main></div>
}

