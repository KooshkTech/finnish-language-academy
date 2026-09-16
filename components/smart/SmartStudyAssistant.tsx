'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { BrainCircuit, ChevronDown, Search, Settings2, Sparkles, X } from 'lucide-react'
import { analyzeSmartQuery } from '@/data/smart-analysis'
import type { LearningLevelId } from '@/data/levels'
import type { SmartOptionKey, SmartSection, SmartStudySettings } from '@/types/smart'

const KEY = 'opiope_smart_study_settings_v1'
const defaultSettings: SmartStudySettings = {
  meaning: true,
  grammar: true,
  sentences: true,
  inflection: false,
  spoken: true,
  synonyms: false,
  blackboard: true,
  ai: false,
}

const optionLabels: Array<[SmartOptionKey,string]> = [
  ['meaning','Merkitys'],
  ['grammar','Kielioppi'],
  ['sentences','Lauseet'],
  ['inflection','Taivutus'],
  ['spoken','Puhekieli'],
  ['synonyms','Synonyymit'],
  ['blackboard','Lähetä harjoitustaululle'],
  ['ai','AI-opettaja, jos määritetty'],
]

function readSettings(): SmartStudySettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<SmartStudySettings>) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

function levelFromPath(pathname: string): LearningLevelId | null {
  const match = pathname.match(/^\/levels\/(a0|a1|a2|b1|b2|c1|c2)(?:\/|$)/)
  return (match?.[1] as LearningLevelId | undefined) ?? null
}

export function SmartStudyAssistant() {
  const pathname = usePathname()
  const level = useMemo(() => levelFromPath(pathname), [pathname])
  const [open,setOpen] = useState(false)
  const [query,setQuery] = useState('')
  const [settings,setSettings] = useState<SmartStudySettings>(readSettings)
  const [sections,setSections] = useState<SmartSection[]>([])
  const [aiText,setAiText] = useState('')
  const [busy,setBusy] = useState(false)

  if (pathname === '/' || pathname.startsWith('/teacher') || pathname.startsWith('/course/sv')) return null

  function updateSetting(key: SmartOptionKey, checked: boolean) {
    const next = { ...settings, [key]: checked }
    setSettings(next)
    window.localStorage.setItem(KEY, JSON.stringify(next))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    const nextSections = analyzeSmartQuery(trimmed, level, settings)
    setSections(nextSections)
    setAiText('')

    if (settings.blackboard) {
      window.dispatchEvent(new CustomEvent('opiope:blackboard-note', { detail: { title: `Tarkka analyysi · ${trimmed}`, body: nextSections.map(section => `${section.title}: ${section.body}`).join('\n') } }))
    }

    if (settings.ai) {
      setBusy(true)
      try {
        const response = await fetch('/api/ai-tutor', {
          method: 'POST', headers: {'content-type':'application/json'},
          body: JSON.stringify({ question: `Analyze the Finnish/Swedish word or phrase “${trimmed}”. Give meaning, grammar, inflection, natural sentence examples, and spoken/register notes.`, level: level?.toUpperCase() ?? 'A2', learningLanguage: 'fi', ageTier: 'adult' }),
        })
        const data = await response.json() as { answer?: string; error?: string }
        setAiText(data.answer ?? data.error ?? 'AI-opettaja ei vastannut.')
      } catch {
        setAiText('AI-opettajaan ei saatu yhteyttä.')
      } finally {
        setBusy(false)
      }
    }
  }

  return <div className={`smart-study-dock ${open ? 'open' : ''}`}>
    {!open && <button className="smart-study-trigger" type="button" onClick={()=>setOpen(true)} aria-label="Avaa Tarkka älyapu"><Sparkles size={18}/><span>Tarkka</span></button>}
    {open && <section className="smart-study-panel" aria-label="Tarkka älyapu">
      <header><div><BrainCircuit size={20}/><div><strong>Tarkka</strong><small>{level ? `${level.toUpperCase()}-tila` : 'OpiOpe älyapu'}</small></div></div><button type="button" onClick={()=>setOpen(false)} aria-label="Sulje"><X size={18}/></button></header>
      <form onSubmit={submit} className="smart-study-form"><Search size={17}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Kirjoita sana tai lause, esim. Tarkka"/><button type="submit">Analysoi</button></form>

      <details className="smart-options" open>
        <summary><Settings2 size={16}/> Mitä haluat nähdä? <ChevronDown size={16}/></summary>
        <div className="smart-option-grid">{optionLabels.map(([key,label])=><label key={key}><input type="checkbox" checked={settings[key]} onChange={event=>updateSetting(key,event.target.checked)}/><span>{label}</span></label>)}</div>
      </details>

      {sections.length > 0 && <div className="smart-results">{sections.map((section,index)=><article key={`${section.key}-${index}`}><h3>{section.title}</h3><p>{section.body}</p>{section.examples?.map(example=><small key={example}>{example}</small>)}</article>)}</div>}
      {busy && <p className="smart-ai-state">AI-opettaja analysoi…</p>}
      {aiText && <article className="smart-ai-answer"><strong>AI-opettaja</strong><p>{aiText}</p></article>}
      <footer><Link href="/dictionary">Sanakirja</Link><Link href="/contacts">Tuki</Link></footer>
    </section>}
  </div>
}
