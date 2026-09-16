"use client"
import { useState } from "react"
import { ClassroomNav } from "@/components/classroom/ClassroomNav"
import { Blackboard } from "@/components/classroom/Blackboard"
import { UniversalTools } from "@/components/classroom/UniversalTools"
import { LearningProfileSwitcher } from "@/components/classroom/LearningProfileSwitcher"
import { AssessmentReportCard } from "@/components/classroom/AssessmentReportCard"
import { ArcadeGames } from "./ArcadeGames"

const tabs=["Opi","Harjoittele","Muistikortit","Testi"] as const
type Tab=typeof tabs[number]
const cards=[{front:"linja + auto",back:"linja-auto"},{front:"talo + ssa",back:"talossa · inessive"},{front:"kauppa + sta",back:"kaupasta · elative"}]
const questions=[
 {question:"Choose the correct Finnish compound.",options:["linja-auto","linja auto","auto-linja"],answer:"linja-auto",explanation:"The conventional written form is linja-auto.",dictionaryHeadwords:["linja-auto"]},
 {question:"What case is talossa?",options:["inessiivi","elatiivi","illatiivi"],answer:"inessiivi",explanation:"-ssa/-ssä typically marks the inessive: inside/in something."},
]
export function ArcadeClassroom(){const[tab,setTab]=useState<Tab>("Harjoittele");return <div className="classroom-shell"><ClassroomNav/><main className="classroom-main"><header className="classroom-header"><div><p className="eyebrow">PELILLINEN HARJOITTELU</p><h1>OpiOpe Arcade</h1><p>Pelit tukevat oikeita oppimistavoitteita. Lasten tilassa palkitseva palaute korvaa rangaistukset.</p></div></header><LearningProfileSwitcher/><UniversalTools title="Pelit" flashcards={cards}/><div className="classroom-tabs" role="tablist">{tabs.map(item=><button key={item} role="tab" aria-selected={tab===item} onClick={()=>setTab(item)}>{item}</button>)}</div>{tab==="Opi"&&<div className="classroom-grid"><section className="module-panel"><h2>Pelisäännöt</h2><p>Yhdyssanapeli harjoittaa yhdyssanojen kirjoittamista. Sijamuotopeli harjoittaa sijamuotojen tunnistamista. Istunnon XP näkyy paikallisesti eikä sitä tallenneta tilille ennen palvelinvarmennettua pisteytystä.</p></section><Blackboard blocks={[{type:"table",title:"Pelisääntö",rows:[["linja + auto","linja-auto"],["talo + ssa","talossa"],["kauppa + sta","kaupasta"]]}]}/></div>}{tab==="Harjoittele"&&<ArcadeGames/>}{tab==="Muistikortit"&&<div className="module-panel"><h2>Pelien muistikortit</h2><div className="flashcard-grid">{cards.map(card=><article className="topic-flashcard" key={card.front}><small>MUISTI</small><strong>{card.front}</strong><span>{card.back}</span></article>)}</div></div>}{tab==="Testi"&&<div className="module-panel"><h2>Pelien osaamistesti</h2><AssessmentReportCard title="Pelit" questions={questions}/></div>}</main></div>}

