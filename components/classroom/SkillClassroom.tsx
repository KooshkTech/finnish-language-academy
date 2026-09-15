"use client"
import { useState } from "react"
import { ClassroomNav } from "./ClassroomNav"
import { Blackboard } from "./Blackboard"
import { AiTutorPanel } from "./AiTutorPanel"
import { SpeakingRecorder } from "./SpeakingRecorder"
import { UniversalTools } from "./UniversalTools"
import { LearningProfileSwitcher } from "./LearningProfileSwitcher"
import { AssessmentReportCard } from "./AssessmentReportCard"
import { InlineDictionaryText } from "@/components/dictionary/InlineDictionaryText"
import type { BlackboardBlock, SkillModule } from "@/types/classroom"
import { InteractiveQALoop } from "./InteractiveQALoop"
import { buildQAQuestions } from "@/data/qa-sessions"

const tabs = ["Opi", "Harjoittele", "Muistikortit", "Testi ja arviointi"] as const
type Tab = typeof tabs[number]

export function SkillClassroom({ module }: { module: SkillModule }) {
  const [tab, setTab] = useState<Tab>("Opi")
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number,string>>({})
  const [flipped, setFlipped] = useState<Record<number,boolean>>({})
  const [liveBlocks, setLiveBlocks] = useState<BlackboardBlock[]>([])
  const qaQuestions = buildQAQuestions("A1", module)

  function addBlackboardBlock(block: BlackboardBlock) {
    setLiveBlocks(current => [...current.slice(-2), block])
  }

  return <div className="classroom-shell">
    <ClassroomNav/>
    <main className="classroom-main">
      <header className="classroom-header">
        <div><p className="eyebrow">{module.levelRange} · OPIOPE OPPITUNTI</p><h1>{module.title}</h1><p>{module.subtitle}</p></div>
        <div className="accountability-mini"><span>5 ♥</span><span>0 Kulta</span><span>0 XP</span></div>
      </header>
      <LearningProfileSwitcher/>
      <UniversalTools title={module.title} flashcards={module.flashcards}/>
      {["/speaking","/listening","/reading","/writing","/understanding","/vocabulary"].includes(module.route) && <InteractiveQALoop questions={qaQuestions} title={`${module.title} · kysymykset`}/>}
      <div className="classroom-tabs" role="tablist">{tabs.map(item=><button key={item} role="tab" aria-selected={tab===item} onClick={()=>setTab(item)}>{item}</button>)}</div>
      <div className="classroom-grid">
        <section className="lesson-workspace">
          {tab === "Opi" && <>
            <div className="module-panel"><h2>Opi</h2>{module.learn.map(item=><p key={item}>• {item}</p>)}<div className="example-stack">{module.examples.map((example,index)=><div key={index}><strong><InlineDictionaryText text={example.source}/></strong><span>{example.target}</span>{example.note&&<small>{example.note}</small>}</div>)}</div></div>
            {module.route === "/speaking" && <SpeakingRecorder/>}
          </>}
          {tab === "Harjoittele" && <div className="module-panel"><h2>Harjoittele</h2><p>Tämä yhteinen harjoitusmoottori antaa välittömän pedagogisen palautteen. Harjoitus ei muuta pysyvää edistymistä ennen kuin oppijan pysyvä tallennus on käytössä.</p>{module.test.map((q,index)=><div className="practice-question" key={q.question}><strong>{q.question}</strong><div>{q.options.map(option=><button key={option} className={practiceAnswers[index]===option?"selected":""} onClick={()=>setPracticeAnswers(current=>({...current,[index]:option}))}>{option}</button>)}</div>{practiceAnswers[index]&&<p className={practiceAnswers[index]===q.answer?"good":"bad"}>{practiceAnswers[index]===q.answer?"Oikein. ":"Ei vielä. "}{q.explanation}</p>}</div>)}</div>}
          {tab === "Muistikortit" && <div className="module-panel"><h2>Muistikortit</h2><div className="flashcard-grid">{module.flashcards.map((card,index)=><button key={card.front} className="topic-flashcard" onClick={()=>setFlipped(current=>({...current,[index]:!current[index]}))}><small>{flipped[index]?"VASTAUS":"KYSYMYS"}</small><strong>{flipped[index]?card.back:card.front}</strong><span>Käännä kortti</span></button>)}</div><p className="module-notice">SM-2-ajastus on tuettu tietomallissa, mutta tämä näkymä ei esitä pysyviä kertauspäiviä, jos tilin tallennus ei ole käytettävissä.</p></div>}
          {tab === "Testi ja arviointi" && <div className="module-panel"><h2>Testi ja arviointi</h2><AssessmentReportCard title={module.title} questions={module.test}/></div>}
          {module.route === "/ai-tutor" && <AiTutorPanel onBlackboardUpdate={addBlackboardBlock}/>} 
        </section>
        <Blackboard blocks={[...module.blackboard, ...liveBlocks]}/>
      </div>
    </main>
  </div>
}

