"use client"
import { FormEvent, useMemo, useState } from "react"
import { dictionaryEntries, searchDictionary } from "@/data/dictionary"
import type { LearningLanguage } from "@/types/dictionary"
import { DictionaryCard } from "./DictionaryCard"

function initialDictionaryQuery() {
  if (typeof window === "undefined") return "ymmärtää"
  return new URLSearchParams(window.location.search).get("q") || "ymmärtää"
}

export function DictionarySearch() {
  const [query, setQuery] = useState(initialDictionaryQuery)
  const [submitted, setSubmitted] = useState(initialDictionaryQuery)
  const [language, setLanguage] = useState<LearningLanguage>("fi")
  const results = useMemo(() => searchDictionary(submitted, language), [submitted, language])
  function submit(event: FormEvent) { event.preventDefault(); setSubmitted(query) }
  return <div className="dictionary-search-shell">
    <form className="dictionary-search" onSubmit={submit}>
      <label htmlFor="dictionary-query">Hae sanaa / Sök ord</label>
      <div><input id="dictionary-query" value={query} onChange={e=>setQuery(e.target.value)} placeholder="ymmärtää / förstå"/><button type="submit">Hae</button></div>
      <div className="dictionary-language-switch" role="group" aria-label="Dictionary language">
        <button type="button" aria-pressed={language === "fi"} onClick={()=>setLanguage("fi")}>Suomi</button>
        <button type="button" aria-pressed={language === "sv"} onClick={()=>setLanguage("sv")}>Svenska</button>
      </div>
    </form>
    <p className="dictionary-disclaimer">OpiOpe Advanced Dictionary käyttää yksityiskohtaista leksikografista rakennetta. Sisältö on OpiOpen omaa tai erikseen lisensoitua aineistoa eikä sitä esitetä kolmannen osapuolen virallisena sanakirjana.</p>
    {results.length ? results.map(entry => <DictionaryCard entry={entry} key={entry.id}/>) : <div className="module-panel"><h2>Ei osumaa</h2><p>Seed-sanakirjassa on nyt {dictionaryEntries.filter(e=>e.language===language).length} esimerkkihakusanaa. Tuotantoversio tarvitsee lisensoidun tai avoimen leksikkodatan provider-adapterin.</p></div>}
  </div>
}

