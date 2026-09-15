"use client"
import { useState } from "react"
import { ClassroomNav } from "@/components/classroom/ClassroomNav"
import { Blackboard } from "@/components/classroom/Blackboard"
import { UniversalTools } from "@/components/classroom/UniversalTools"
import { LearningProfileSwitcher } from "@/components/classroom/LearningProfileSwitcher"
import { AssessmentReportCard } from "@/components/classroom/AssessmentReportCard"
import { DictionarySearch } from "./DictionarySearch"

const tabs=["Opi","Harjoittele","Muistikortit","Testi"] as const
type Tab=typeof tabs[number]
const cards=[{front:"ymmärtää",back:"saada selville tai käsittää merkitys"},{front:"pärjätä",back:"selviytyä tai tulla toimeen"},{front:"förstå",back:"ymmärtää ruotsiksi"}]
const questions=[
 {question:"Mikä muoto on verbin ymmärtää yksikön ensimmäisen persoonan preesens?",options:["ymmärrän","ymmärtän","ymmärsin"],answer:"ymmärrän",explanation:"Vartalon astevaihtelu tuottaa tässä muodossa vartalon ymmärr-.",dictionaryHeadwords:["ymmärtää"]},
 {question:"Mikä ruotsin substantiivilauseke on oikein?",options:["en jobb","ett jobb","ett jobben"],answer:"ett jobb",explanation:"jobb on ett-sukuinen substantiivi.",dictionaryHeadwords:["jobb"]},
]
export function DictionaryClassroom(){const[tab,setTab]=useState<Tab>("Opi");return <div className="classroom-shell"><ClassroomNav/><main className="classroom-main"><header className="classroom-header"><div><p className="eyebrow">SANAKIRJA · FI / SV</p><h1>OpiOpe Advanced Dictionary</h1><p>Syvä sanakirja, morfologia, IPA, rekisteri ja oikea käyttöyhteys.</p></div></header><LearningProfileSwitcher/><UniversalTools title="Sanakirja" flashcards={cards}/><div className="classroom-tabs" role="tablist">{tabs.map(item=><button key={item} role="tab" aria-selected={tab===item} onClick={()=>setTab(item)}>{item}</button>)}</div><div className="classroom-grid"><section className="lesson-workspace">{tab==="Opi"&&<DictionarySearch/>}{tab==="Harjoittele"&&<div className="module-panel"><h2>Sana-analyysin harjoitus</h2><p>Hae sana, tunnista sanaluokka, taivutustyyppi ja rekisteri. Automaattinen analyysi perustuu sanakirjadataan eikä arvaukseen.</p><DictionarySearch/></div>}{tab==="Muistikortit"&&<div className="module-panel"><h2>Sanakirjan muistikortit</h2><div className="flashcard-grid">{cards.map(card=><article className="topic-flashcard" key={card.front}><small>HAKUSANA</small><strong>{card.front}</strong><span>{card.back}</span></article>)}</div></div>}{tab==="Testi"&&<div className="module-panel"><h2>Sanastotesti</h2><AssessmentReportCard title="Sanakirja" questions={questions}/></div>}</section><Blackboard blocks={[{type:"table",title:"Sanan rakenne",rows:[["ymmärtää","perusmuoto"],["ymmärrän","yksikön 1. persoona, preesens"],["ymmärrä","kieltomuoto"]]},{type:"compare",title:"Rekisteri",leftLabel:"Kirjakieli",left:"Minä ymmärrän.",rightLabel:"Puhekieli",right:"Mä ymmärrän."}]}/></div></main></div>}

