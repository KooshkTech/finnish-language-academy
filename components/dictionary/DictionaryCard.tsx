"use client"
import { useState } from "react"
import type { DictionaryEntry } from "@/types/dictionary"

export function DictionaryCard({ entry }: { entry: DictionaryEntry }) {
  const fi = entry.language === "fi"
  const [saveState,setSaveState]=useState<"idle"|"saving"|"saved"|"login">("idle")
  async function save(){setSaveState("saving");try{const response=await fetch("/api/dictionary/bookmark",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({entryId:entry.id})});setSaveState(response.ok?"saved":response.status===401?"login":"idle")}catch{setSaveState("idle")}}
  return <article className="dictionary-card">
    <header className="dictionary-card-head">
      <div><p className="eyebrow">{entry.language === "fi" ? "SUOMI" : "SVENSKA"} · {entry.cefrLevel}</p><h2>{entry.headword}</h2><p className="ipa">{entry.ipaPhonetic}</p></div>
      <div className="dictionary-head-actions"><span className="dictionary-pos">{entry.partOfSpeech}</span><button type="button" onClick={()=>void save()} disabled={saveState==="saving"}>{saveState==="saved"?(fi?"Tallennettu":"Sparat"):saveState==="login"?(fi?"Kirjaudu tallentaaksesi":"Logga in för att spara"):saveState==="saving"?(fi?"Tallennetaan…":"Sparar…"):(fi?"Tallenna sana":"Spara ord")}</button></div>
    </header>
    <section className="dictionary-morphology">
      <h3>{fi ? "Muoto-oppi" : "Morfologi"}</h3>
      {entry.morphology.language === "fi" ? <dl>
        <div><dt>Kotus</dt><dd>{entry.morphology.kotusTypeNumber ?? "—"}</dd></div>
        <div><dt>Vartalo</dt><dd>{entry.morphology.infinitiveStem ?? "—"}</dd></div>
        <div><dt>K-P-T</dt><dd>{entry.morphology.gradationTier ?? "ei erityistä merkintää"}</dd></div>
        <div><dt>Vokaalisointu</dt><dd>{entry.morphology.vowelHarmony}</dd></div>
      </dl> : <dl>
        <div><dt>Genus</dt><dd>{entry.morphology.gender ?? "—"}</dd></div>
        <div><dt>Plural</dt><dd>{entry.morphology.pluralForms?.join(", ") || "—"}</dd></div>
        <div><dt>Tonaccent</dt><dd>{entry.morphology.pitchAccent ?? "—"}</dd></div>
        <div><dt>Grupp</dt><dd>{entry.morphology.conjugationGroup ?? "—"}</dd></div>
      </dl>}
    </section>
    {entry.definitions.map(def => <section className="dictionary-sense" key={def.senseNumber}>
      <div className="sense-title"><span>{def.senseNumber}</span><div><strong>{def.definitionNative}</strong></div><small>{def.register} · {def.cefrLevel}</small></div>
      <div className="dictionary-examples">{def.examples.map((example,index)=><div key={`${def.senseNumber}-${index}`}>
        <p><strong>Kirjakieli</strong> {example.kirjakieli}</p>
        {example.puhekieli && <p><strong>Puhekieli</strong> {example.puhekieli}</p>}
        <small>{example.grammaticalNotes}</small>
      </div>)}</div>
    </section>)}
    <div className="dictionary-relations">
      <section><h3>{fi ? "Sanayhdistelmät" : "Ordkombinationer"}</h3>{entry.collocations.map(item=><p key={item.phrase}><strong>{item.phrase}</strong></p>)}</section>
      <section><h3>{fi ? "Synonyymit" : "Synonymer"}</h3><p>{entry.synonyms.join(" · ") || "—"}</p><h3>{fi ? "Vastakohdat" : "Antonymer"}</h3><p>{entry.antonyms.join(" · ") || "—"}</p></section>
    </div>
    <footer className="dictionary-source-note">{entry.sourceNote}</footer>
  </article>
}

