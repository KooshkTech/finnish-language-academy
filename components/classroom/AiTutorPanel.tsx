"use client"
import { FormEvent, useState } from "react"
import type { BlackboardBlock } from "@/types/classroom"

interface TutorPayload { answer?: string; error?: string; blackboard?: { title: string; body: string }; dictionaryMatches?: Array<{headword:string;ipa:string;definition:string}> }

export function AiTutorPanel({ onBlackboardUpdate }: { onBlackboardUpdate?: (block: BlackboardBlock) => void }) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [matches, setMatches] = useState<TutorPayload["dictionaryMatches"]>([])
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); if (!question.trim()) return
    setBusy(true); setAnswer(""); setMatches([])
    try {
      const response = await fetch("/api/ai-tutor", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ question, level:"A2", learningLanguage:"fi", ageTier:"adult" }) })
      const payload = await response.json() as TutorPayload
      const text = payload.answer ?? payload.error ?? "AI-opettaja ei ole käytettävissä."
      setAnswer(text); setMatches(payload.dictionaryMatches ?? [])
      if (payload.blackboard) onBlackboardUpdate?.({ type:"note", title:payload.blackboard.title, body:payload.blackboard.body })
      if (payload.dictionaryMatches?.length) onBlackboardUpdate?.({ type:"table", title:"Sanakirjaviitteet", rows:payload.dictionaryMatches.map(item=>[`${item.headword} ${item.ipa}`,item.definition]) })
    } catch { setAnswer("AI-opettajaan ei saatu yhteyttä.") } finally { setBusy(false) }
  }

  return <div className="ai-panel"><form onSubmit={submit}><label htmlFor="teacher-question">Kysy opettajalta</label><textarea id="teacher-question" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Esim. Miksi tässä käytetään partitiivia?"/><button disabled={busy}>{busy ? "Ajattelen…" : "Kysy miksi"}</button></form>{answer && <div className="ai-answer"><strong>Opettajan vastaus</strong><p>{answer}</p>{matches?.length?<div className="ai-dictionary-links">{matches.map(item=><a key={item.headword} href={`/dictionary?q=${encodeURIComponent(item.headword)}`}><strong>{item.headword}</strong><span>{item.ipa}</span><small>{item.definition}</small></a>)}</div>:null}</div>}</div>
}

