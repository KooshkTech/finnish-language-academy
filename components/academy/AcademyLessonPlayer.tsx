'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, CircleAlert, Volume2 } from 'lucide-react'
import { SpeakingRecorder } from '@/components/classroom/SpeakingRecorder'
import type { AcademyLesson, AcademyQuestion } from '@/types/academy'
import { isAcademyAnswerCorrect } from '@/lib/academy-answer.mjs'

const steps = ['Lukutaito','Kuullun ymmärtäminen','Kielioppi & rakenne','Harjoitukset','Puhuminen & ääni','Oppimistesti'] as const

const skillLabel: Record<string,string> = { reading:'Lukutaito', listening:'Kuuntelu', grammar:'Kielioppi', practice:'Harjoitus', speaking:'Puhuminen', writing:'Kirjoittaminen', mastery:'Oppimistesti' }
const posLabel: Record<string,string> = { verb:'verbi', noun:'substantiivi', adjective:'adjektiivi', adverb:'adverbi', phrase:'ilmaus', pronoun:'pronomini' }

function QuestionCard({ question }: { question: AcademyQuestion }) {
  const [answer,setAnswer] = useState('')
  const [checked,setChecked] = useState(false)
  const correct = isAcademyAnswerCorrect(question, answer)
  return <article className="engine-exercise">
    <p className="modal-label">{skillLabel[question.skill] ?? 'Harjoitus'}</p>
    <h3>{question.prompt}</h3>
    {question.options ? <div className="answer-list">{question.options.map(option => <button type="button" key={option} className={answer===option?'selected':''} onClick={()=>{setAnswer(option);setChecked(false)}}>{option}</button>)}</div> : <input className="large-input" value={answer} onChange={e=>{setAnswer(e.target.value);setChecked(false)}} placeholder="Kirjoita vastaus" />}
    <button type="button" className="outline-button" disabled={!answer.trim()} onClick={()=>setChecked(true)}>Tarkista</button>
    {checked && <div className={`feedback ${correct?'':'feedback-error'}`}>{correct?<CheckCircle2 size={17}/>:<CircleAlert size={17}/>}<span><strong>{correct?'Oikein.':'Korjaa vielä.'}</strong> {question.explanation}{!correct && <> <b>Mallivastaus:</b> {question.answer}</>}</span></div>}
  </article>
}

export default function AcademyLessonPlayer({ lesson, nextLesson }: { lesson: AcademyLesson; nextLesson?: { title: string; href: string } }) {
  const [step,setStep] = useState(0)
  const [showTranscript,setShowTranscript] = useState(false)
  const [speed,setSpeed] = useState(0.75)
  const [completed,setCompleted] = useState(false)
  const [draft, setDraft] = useState('')
  const [audioStatus, setAudioStatus] = useState('')
  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices()
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel() }
  }, [])
  const vocabularyCount = lesson.vocabulary.length
  const sectionQuestions = useMemo(()=>{
    if(step===0)return lesson.reading.questions
    if(step===1)return lesson.listening.questions
    if(step===2)return lesson.grammar.questions
    if(step===3)return lesson.practice
    if(step===5)return lesson.masteryTest
    return []
  },[lesson,step])
  function speak(text:string){
    if(!('speechSynthesis' in window)) { setAudioStatus('Selain ei tue koneääntä. Käytä transkriptiota.'); return }
    const voice = window.speechSynthesis.getVoices().find(item => /^fi(?:-|$)/i.test(item.lang))
    if (!voice) { setAudioStatus('Suomenkielistä koneääntä ei löytynyt. Lisää suomen puheääni laitteen asetuksissa tai käytä transkriptiota.'); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'fi-FI'; u.voice = voice; u.rate = speed
    u.onstart = () => setAudioStatus('Koneääni toistaa tekstiä.')
    u.onend = () => setAudioStatus('Toisto päättyi.')
    u.onerror = () => setAudioStatus('Koneäänen toisto ei onnistunut. Käytä transkriptiota.')
    window.speechSynthesis.speak(u)
  }
  return <main className="course-page lesson-player-page"><div className="course-page-inner">
    <div className="lesson-topbar"><Link className="back-link" href={`/learn/academy/${lesson.bookId}`}>← Kirjaan</Link><div className="lesson-meter"><span style={{width:`${((step+1)/steps.length)*100}%`}}/></div><span className="lesson-score">{step+1}/{steps.length}</span></div>
    <header className="course-hero compact-course-hero"><p className="eyebrow">{lesson.bookId.toUpperCase()} · {lesson.level} · OPPITUNTI {String(lesson.number).padStart(2,'0')}</p><h1>{lesson.title}</h1><p>{lesson.topic} · {lesson.estimatedMinutes} min · {vocabularyCount} ydinsanaa</p><details><summary>Tavoitteet ja esitiedot</summary><ul>{lesson.objectives.map(item=><li key={item}>{item}</li>)}</ul><p>Suositellut esitiedot: {lesson.prerequisites.join(', ') || 'Ei vaadittuja esitietoja.'}</p></details></header>
    <p>Selaimen koneääni — ei äänitettyä materiaalia.</p><p role="status" aria-live="polite">{audioStatus}</p>
    <section className="lesson-stage-card"><div className="lesson-stage-head"><div><span className="preview-badge">{steps[step]}</span><h2>{steps[step]}</h2></div><span>v{lesson.contentVersion}</span></div>
      {step===0 && <><h3>{lesson.reading.title}</h3><p className="lesson-stage-copy" style={{whiteSpace:'pre-line'}}>{lesson.reading.text}</p><div className="engine-exercise-actions"><button className="outline-button" onClick={()=>speak(lesson.reading.text)}><Volume2 size={16}/> Kuuntele</button></div><h3>Sanasto</h3><div className="answer-list">{lesson.vocabulary.map(item=><div key={item.fi} className="catalog-card"><strong>{item.fi}</strong>{item.definitionFi && <span>{item.definitionFi}</span>}<span>{item.example}</span><small>{posLabel[item.partOfSpeech] ?? 'sana'} · {item.cefr}</small></div>)}</div></>}
      {step===1 && <><h3>{lesson.listening.title}</h3><p>{lesson.listening.speedGuidance}</p><div className="lesson-audio-speed">{[0.5,0.75,1].map(value=><button key={value} aria-pressed={speed===value} onClick={()=>setSpeed(value)}>{value}×</button>)}</div><button className="primary-button" onClick={()=>speak(lesson.listening.transcript)}>▶ Kuuntele</button><button className="outline-button" onClick={()=>setShowTranscript(v=>!v)}>{showTranscript?'Piilota teksti':'Näytä teksti'}</button>{showTranscript&&<p className="lesson-audio-transcript">{lesson.listening.transcript}</p>}</>}
      {step===2 && <><h3>Havaitse</h3>{lesson.grammar.discover.map(item=><p key={item}>{item}</p>)}<h3>Selitys</h3><p>{lesson.grammar.explain}</p><h3>Rakenne</h3>{lesson.grammar.deconstruct.map(item=><p key={item}>{item}</p>)}<h3>Vertaa</h3>{lesson.grammar.compare.map(item=><p key={item}>{item}</p>)}</>}
      {step===3 && <><p>{lesson.warmup}</p>{lesson.differentiatedTasks && <details><summary>Valitse sopiva harjoituksen tuki</summary><h3>Tuettu harjoitus</h3><p>{lesson.differentiatedTasks.easier}</p><h3>Lisähaaste</h3><p>{lesson.differentiatedTasks.harder}</p></details>}<h3>Kirjoittaminen</h3><p>{lesson.writing.prompt}</p><label htmlFor="academy-writing">Oma kirjoitus</label><textarea id="academy-writing" className="large-input" rows={8} value={draft} onChange={event=>setDraft(event.target.value)} placeholder="Kirjoita tähän" /><p>Luonnos säilyy vain tämän oppitunnin avoimessa näkymässä. Kopioi se talteen ennen poistumista. Ei automaattista arviointia.</p><ul>{lesson.writing.checklist.map(item=><li key={item}>{item}</li>)}</ul><details><summary>{lesson.bookId.startsWith('fi-')?'Lähdeteksti rakenteen malliksi (ei valmis tehtävävastaus)':'Malliteksti'}</summary><p>{lesson.writing.model}</p></details></>}
      {step===4 && <><h3>Puhu</h3><p>{lesson.speaking.prompt}</p><p><strong>Malli:</strong> {lesson.speaking.model}</p><h3>Tilanneharjoitus</h3>{lesson.speaking.roleplay.map(line=><p key={line}>{line}</p>)}<SpeakingRecorder/></>}
      {step===5 && <><p>Kertaustehtävät palauttavat mieleen oppitunnin ydinsisällön ja kertaustunnilla aiempia tehtäviä. Tämä ei ole uusi tasokoe eikä virallinen CEFR- tai YKI-arvio.</p></>}
      {sectionQuestions.length>0&&<div className="engine-exercises">{sectionQuestions.map(question=><QuestionCard key={`${step}-${question.id}`} question={question}/>)}</div>}
    </section>
    <div className="lesson-navigation"><button className="outline-button" disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))}>← Edellinen</button>{step<steps.length-1?<button className="primary-button" onClick={()=>setStep(s=>Math.min(steps.length-1,s+1))}>Seuraava →</button>:<button className="primary-button" onClick={()=>setCompleted(true)}>Merkitse valmiiksi</button>}</div>
    {completed&&<div className="lesson-complete-panel"><CheckCircle2 size={28}/><div><strong>Oppitunti valmis</strong><p>Jatka seuraavaan julkaistuun oppituntiin tai kertaa vaikeat kohdat. Valmis-merkintä koskee vain tätä näkymää, ei tilitallennusta tai todistettua osaamista.</p>{nextLesson?<Link className="primary-button" href={nextLesson.href}>Seuraava oppitunti: {nextLesson.title} →</Link>:<Link className="primary-button" href="/learn/academy">Palaa akatemiaan →</Link>}</div></div>}
    <details><summary>Kertausvinkit</summary><ul>{lesson.review.map(item=><li key={item}>{item}</li>)}</ul></details>
  </div></main>
}
