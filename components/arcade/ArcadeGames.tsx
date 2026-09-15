"use client"
import { useMemo, useState } from "react"

const compounds = [
  {left:"linja",right:"auto",answer:"linja-auto"},
  {left:"työ",right:"paikka",answer:"työpaikka"},
  {left:"sähkö",right:"posti",answer:"sähköposti"},
]
const cases = [
  {base:"talo",form:"talossa",caseName:"inessiivi"},
  {base:"kauppa",form:"kaupasta",caseName:"elatiivi"},
  {base:"koulu",form:"kouluun",caseName:"illatiivi"},
]

export function ArcadeGames(){
  const [game,setGame]=useState<"compound"|"cases">("compound")
  const [index,setIndex]=useState(0); const [score,setScore]=useState(0); const [feedback,setFeedback]=useState("")
  const item=useMemo(()=>game==="compound"?compounds[index%compounds.length]:cases[index%cases.length],[game,index])
  function answer(value:string){ const correct=game==="compound"?value===(item as typeof compounds[number]).answer:value===(item as typeof cases[number]).caseName; setFeedback(correct?"Oikein! +10 XP":"Ei vielä — katso rakenne ja yritä uudelleen."); if(correct){setScore(s=>s+10);setTimeout(()=>{setIndex(i=>i+1);setFeedback("")},450)} }
  return <div className="arcade-shell"><div className="arcade-top"><div><p className="eyebrow">PELAA & OPI</p><h1>OpiOpe Pelit</h1><p>Nopeat pelit harjoittavat oikeita kielirakenteita. Ei kasinoefektejä eikä keinotekoisia palkintoja.</p></div><strong>{score} XP · istunto</strong></div><div className="arcade-tabs"><button aria-pressed={game==="compound"} onClick={()=>{setGame("compound");setIndex(0);setFeedback("")}}>Yhdyssana</button><button aria-pressed={game==="cases"} onClick={()=>{setGame("cases");setIndex(0);setFeedback("")}}>Sijamuoto</button></div>{game==="compound"?<section className="arcade-game"><h2>Yhdistä sanat</h2><div className="compound-parts"><span>{(item as typeof compounds[number]).left}</span><b>+</b><span>{(item as typeof compounds[number]).right}</span></div><div className="arcade-options">{[(item as typeof compounds[number]).answer,`${(item as typeof compounds[number]).left} ${(item as typeof compounds[number]).right}`,`${(item as typeof compounds[number]).right}-${(item as typeof compounds[number]).left}`].map(option=><button key={option} onClick={()=>answer(option)}>{option}</button>)}</div></section>:<section className="arcade-game"><h2>Mikä sijamuoto?</h2><p><strong>{(item as typeof cases[number]).base}</strong> → <strong>{(item as typeof cases[number]).form}</strong></p><div className="arcade-options">{["inessiivi","elatiivi","illatiivi","allatiivi"].map(option=><button key={option} onClick={()=>answer(option)}>{option}</button>)}</div></section>}<p className={feedback.startsWith("Oikein")?"good":"bad"}>{feedback}</p><a className="live-quiz-link" href="/arcade/live">Reaaliaikainen tietovisa →</a></div>
}

