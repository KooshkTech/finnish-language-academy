'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { classId: string; language: 'fi' | 'sv' }

export default function ClassSessionForm({ classId, language }: Props) {
  const fi = language === 'fi'
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('')
    const form = new FormData(event.currentTarget)
    const response = await fetch(`/api/teacher/classes/${classId}/sessions`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: form.get('title'), description: form.get('description'),
        startsAt: form.get('startsAt'), endsAt: form.get('endsAt'),
        meetingUrl: form.get('meetingUrl'), locationText: form.get('locationText'),
      }),
    })
    const payload = await response.json() as { error?: string }
    if (!response.ok) setMessage(payload.error ?? (fi ? 'Tunnin luonti epäonnistui.' : 'Det gick inte att skapa lektionen.'))
    else { event.currentTarget.reset(); setMessage(fi ? 'Tunti ajastettu.' : 'Lektionen har schemalagts.'); router.refresh() }
    setBusy(false)
  }

  return <form onSubmit={submit} className="teacher-dashboard-card" style={{display:'grid',gap:12}}>
    <h3>{fi ? 'Ajasta live-tunti' : 'Schemalägg livelektion'}</h3>
    <label>{fi ? 'Otsikko' : 'Rubrik'}<input name="title" required minLength={2} maxLength={180}/></label>
    <label>{fi ? 'Kuvaus' : 'Beskrivning'}<textarea name="description" rows={3} maxLength={4000}/></label>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12}}>
      <label>{fi ? 'Alkaa' : 'Börjar'}<input name="startsAt" type="datetime-local" required/></label>
      <label>{fi ? 'Päättyy' : 'Slutar'}<input name="endsAt" type="datetime-local" required/></label>
    </div>
    <label>{fi ? 'Kokouslinkki (valinnainen)' : 'Möteslänk (valfri)'}<input name="meetingUrl" type="url" placeholder="https://..." maxLength={1000}/></label>
    <label>{fi ? 'Paikka (valinnainen)' : 'Plats (valfri)'}<input name="locationText" maxLength={240}/></label>
    <button type="submit" disabled={busy}>{busy ? (fi ? 'Tallennetaan…' : 'Sparar…') : (fi ? 'Ajasta tunti' : 'Schemalägg lektion')}</button>
    {message ? <p role="status">{message}</p> : null}
  </form>
}

