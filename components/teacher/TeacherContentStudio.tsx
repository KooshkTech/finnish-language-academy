'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { BookOpenCheck, ChevronDown, FileUp, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react'
import type { GeneratedLessonDraft } from '@/types/teacher-content'
import { TeacherLessonPublisher } from '@/components/teacher/TeacherLessonPublisher'

type ApiResult = {
  error?: string
  message?: string
  status?: string
  materialId?: string
  draftId?: string
  draft?: GeneratedLessonDraft
}

export function TeacherContentStudio() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [draft, setDraft] = useState<GeneratedLessonDraft | null>(null)
  const [draftId, setDraftId] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('Materiaalia käsitellään…')
    setDraft(null)
    setDraftId('')
    try {
      const form = new FormData(event.currentTarget)
      form.set('rightsConfirmed', form.get('rightsConfirmed') === 'on' ? 'true' : 'false')
      const response = await fetch('/api/teacher/content/generate', { method: 'POST', body: form })
      const data = await response.json() as ApiResult
      if (!response.ok && response.status !== 202) {
        setMessage(data.error ?? 'Luonnoksen luonti epäonnistui.')
        return
      }
      setMessage(data.message ?? 'Valmis.')
      setDraft(data.draft ?? null)
      setDraftId(data.draftId ?? '')
    } catch {
      setMessage('Yhteysvirhe. Yritä uudelleen.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="teacher-content-page">
    <header className="teacher-settings-header">
      <Link href="/teacher/settings">← Opettajan asetukset</Link>
      <div><p className="eyebrow">OPETTAJAN SISÄLTÖSTUDIO</p><h1>Lataa materiaali. Luo oppituntiluonnos.</h1><p>OpiOpe voi muodostaa lähdemateriaalista lesson-, vocabulary-, grammar-, Blackboard-, practice-, flashcard- ja testiluonnokset. Kaikki syntyy ensin <strong>review-required</strong>-tilaan: mitään ei julkaista automaattisesti.</p></div>
    </header>

    <section className="teacher-content-grid">
      <form className="teacher-content-form" onSubmit={submit}>
        <details open><summary><FileUp size={18}/> 1. Lähdemateriaali <ChevronDown size={17}/></summary><div className="teacher-content-fields">
          <label>Tiedosto <input name="file" type="file" accept=".txt,.md,.pdf,.png,.jpg,.jpeg,.webp,.mp3,.wav,text/plain,text/markdown,application/pdf,image/png,image/jpeg,image/webp,audio/mpeg,audio/wav" /></label>
          <p className="teacher-field-note">TXT/Markdown voidaan käsitellä heti. PDF, kuva ja ääni tarvitsevat OCR/STT-processorin, jos lähdetekstiä ei liitetä alle.</p>
          <label>tai liitä lähdeteksti<textarea name="sourceText" rows={9} maxLength={24000} placeholder="Liitä oma opetusmateriaali tai teksti tähän…" /></label>
        </div></details>

        <details open><summary><BookOpenCheck size={18}/> 2. Oppitunnin kohde <ChevronDown size={17}/></summary><div className="teacher-content-fields teacher-inline-fields">
          <label>Kieli<select name="language" defaultValue="fi"><option value="fi">Suomi</option><option value="sv">Ruotsi</option></select></label>
          <label>Taso<select name="cefrLevel" defaultValue="A1">{['A0','A1','A2','B1','B2','C1','C2'].map(level=><option key={level} value={level}>{level}</option>)}</select></label>
          <label className="teacher-wide-field">Opettajan ohje<textarea name="instruction" rows={4} maxLength={1200} placeholder="Esim. Painota puhekieltä ja tee harjoitukset työelämän tilanteisiin." /></label>
        </div></details>

        <details open><summary><ShieldCheck size={18}/> 3. Oikeudet ja tarkistus <ChevronDown size={17}/></summary><div className="teacher-content-fields">
          <label className="teacher-rights-check"><input type="checkbox" name="rightsConfirmed" required/><span><strong>Vahvistan, että minulla on oikeus käyttää tätä materiaalia opetuksessa.</strong><small>Älä lataa oppikirjoja, uutisartikkeleita, kuvia, ääntä tai muuta aineistoa, johon sinulla ei ole tarvittavaa lupaa. OpiOpe tuottaa luonnoksen eikä julkaise sitä automaattisesti.</small></span></label>
        </div></details>

        <button className="teacher-generate-button" type="submit" disabled={busy}><WandSparkles size={18}/>{busy ? 'Luodaan turvallista luonnosta…' : 'Luo oppituntiluonnos'}</button>
        {message && <p className="teacher-content-message" aria-live="polite">{message}</p>}
      </form>

      <aside className="teacher-content-safety">
        <Sparkles size={22}/><h2>Mitä OpiOpe tekee?</h2>
        <ol><li>tunnistaa tavoitetason ja kielen</li><li>tiivistää lähteen omin sanoin</li><li>luo sanaston ja kielioppipisteet</li><li>luo Blackboard-muistiinpanot</li><li>luo harjoituksia ja flashcardeja</li><li>luo testin ja vastausten selitykset</li><li>merkitsee epävarmuudet opettajalle</li></ol>
        <p><strong>Human review gate:</strong> opettajan on tarkistettava oikeellisuus, tekijänoikeudet, ikätaso ja pedagoginen sopivuus ennen julkaisua.</p>
      </aside>
    </section>

    {draft && <LessonDraftPreview draft={draft} draftId={draftId}/>} 
  </main>
}

function LessonDraftPreview({ draft, draftId }: { draft: GeneratedLessonDraft; draftId: string }) {
  return <section className="teacher-draft-preview">
    <div className="teacher-draft-heading"><div><p className="eyebrow">AI-LUONNOS · TARKISTUS VAADITAAN</p><h2>{draft.title}</h2><p>{draft.objective}</p></div><span>{draft.language.toUpperCase()} · {draft.cefrLevel}</span></div>
    <div className="teacher-draft-columns">
      <details open><summary>Oppitunti ({draft.lesson.theory.length})</summary><ul>{draft.lesson.theory.map(item=><li key={item}>{item}</li>)}</ul></details>
      <details open><summary>Sanasto ({draft.vocabulary.length})</summary><ul>{draft.vocabulary.map(item=><li key={item.term}><strong>{item.term}</strong> — {item.meaning}<small>{item.example}</small></li>)}</ul></details>
      <details><summary>Kielioppi ({draft.grammar.length})</summary><ul>{draft.grammar.map(item=><li key={item.title}><strong>{item.title}</strong> — {item.explanation}</li>)}</ul></details>
      <details><summary>Blackboard ({draft.blackboard.length})</summary><ul>{draft.blackboard.map(item=><li key={`${item.heading}-${item.body}`}><strong>{item.heading}</strong> — {item.body}</li>)}</ul></details>
      <details><summary>Harjoitukset ({draft.exercises.length})</summary><ol>{draft.exercises.map((item,index)=><li key={`${item.prompt}-${index}`}>{item.prompt}<small>Vastaus: {item.answer} · {item.explanation}</small></li>)}</ol></details>
      <details><summary>Muistikortit ({draft.flashcards.length})</summary><ul>{draft.flashcards.map(item=><li key={item.front}><strong>{item.front}</strong> → {item.back}</li>)}</ul></details>
      <details><summary>Testi ({draft.test.length})</summary><ol>{draft.test.map((item,index)=><li key={`${item.prompt}-${index}`}>{item.prompt}<small>Vastaus: {item.answer}</small></li>)}</ol></details>
      <details open><summary>Opettajan tarkistuslista</summary><ul>{[...draft.teacherNotes,...draft.limitations].map((item,index)=><li key={`${item}-${index}`}>{item}</li>)}</ul></details>
    </div>
    {draftId && <TeacherLessonPublisher draftId={draftId}/>}
  </section>
}

