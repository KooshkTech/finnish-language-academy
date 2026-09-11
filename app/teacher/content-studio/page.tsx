'use client'

import { FormEvent, useState } from 'react'

export default function TeacherContentStudioPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [language, setLanguage] = useState<'fi' | 'sv'>('fi')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setLoading(true)
    setResult('')
    const response = await fetch('/api/teacher/lesson-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: form.get('topic'),
        cefrLevel: form.get('cefrLevel'),
        targetLanguage: language,
        specialProfile: form.get('specialProfile'),
        frequency: form.get('frequency'),
      }),
    })
    const payload = await response.json()
    setLoading(false)
    setResult(response.ok ? JSON.stringify(payload.content, null, 2) : payload.error ?? (language === 'sv' ? 'Något gick fel.' : 'Jotain meni pieleen.'))
  }

  const fi = language === 'fi'
  return (
    <main style={{maxWidth:1000,margin:'0 auto',padding:'32px 20px'}}>
      <p style={{letterSpacing:2,textTransform:'uppercase',opacity:.65}}>{fi ? 'OPETTAJAN SISÄLTÖSTUDIO' : 'LÄRARENS INNEHÅLLSSTUDIO'}</p>
      <h1>{fi ? 'Luo oppitunnin luonnos' : 'Skapa ett lektionsutkast'}</h1>
      <p>{fi ? 'Tekoäly luo vain luonnoksen. Tarkista sisältö ennen julkaisua.' : 'AI skapar endast ett utkast. Granska innehållet före publicering.'}</p>

      <div style={{display:'flex',gap:8,margin:'20px 0'}}>
        <button type="button" onClick={() => setLanguage('fi')} aria-pressed={fi}>Suomi</button>
        <button type="button" onClick={() => setLanguage('sv')} aria-pressed={!fi}>Svenska</button>
      </div>

      <form onSubmit={submit} style={{display:'grid',gap:16}}>
        <label>{fi ? 'Aihe' : 'Ämne'}<input required name="topic" /></label>
        <label>{fi ? 'Taso' : 'Nivå'}<select name="cefrLevel" defaultValue="A1"><option>A0</option><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option></select></label>
        <label>{fi ? 'Kurssityyppi' : 'Kurstyp'}<select name="specialProfile" defaultValue="general"><option value="general">{fi ? 'Yleinen' : 'Allmän'}</option><option value="work">{fi ? 'Työelämä' : 'Arbetsliv'}</option><option value="yki">YKI</option><option value="integration">{fi ? 'Suomi arkeen ja kotoutumiseen' : 'Finska för vardag och integration'}</option></select></label>
        <label>{fi ? 'Luonnoksen rytmi' : 'Utkastfrekvens'}<select name="frequency" defaultValue="manual"><option value="manual">{fi ? 'Manuaalisesti' : 'Manuellt'}</option><option value="daily">{fi ? 'Päivittäin' : 'Dagligen'}</option><option value="weekly">{fi ? 'Viikoittain' : 'Varje vecka'}</option><option value="monthly">{fi ? 'Kuukausittain' : 'Varje månad'}</option><option value="yearly">{fi ? 'Vuosittain' : 'Årligen'}</option></select></label>
        <button disabled={loading} type="submit">{loading ? (fi ? 'Luodaan…' : 'Skapar…') : (fi ? 'Luo luonnos' : 'Skapa utkast')}</button>
      </form>

      {result && <section style={{marginTop:28}}><h2>{fi ? 'Luonnos' : 'Utkast'}</h2><pre style={{whiteSpace:'pre-wrap'}}>{result}</pre></section>}
    </main>
  )
}
