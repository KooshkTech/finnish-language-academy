'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { language: 'fi' | 'sv' }

export default function TeacherClassCreateForm({ language }: Props) {
  const router = useRouter()
  const fi = language === 'fi'
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/teacher/classes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: String(form.get('name') ?? '') }),
    })
    const data = await response.json() as { error?: string; item?: { name: string; join_code: string } }
    if (response.ok) {
      event.currentTarget.reset()
      setMessage(fi ? `Luokka luotu. Liittymiskoodi: ${data.item?.join_code ?? ''}` : `Klassen skapades. Anslutningskod: ${data.item?.join_code ?? ''}`)
      router.refresh()
    } else {
      setMessage(data.error ?? (fi ? 'Luokan luonti epäonnistui.' : 'Det gick inte att skapa klassen.'))
    }
    setBusy(false)
  }

  return <form onSubmit={submit} className="teacher-dashboard-card" style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
    <div>
      <p className="eyebrow">{fi ? 'UUSI LUOKKA' : 'NY KLASS'}</p>
      <h2>{fi ? 'Luo opetusryhmä' : 'Skapa undervisningsgrupp'}</h2>
      <p>{fi ? 'Luokka luodaan automaattisesti valitulle suomen kurssille.' : 'Klassen skapas automatiskt för den valda svenskakursen.'}</p>
    </div>
    <label>{fi ? 'Luokan nimi' : 'Klassens namn'}
      <input name="name" required minLength={2} maxLength={120} placeholder={fi ? 'Esim. A1 iltaryhmä' : 'T.ex. A1 kvällsgrupp'} />
    </label>
    <button type="submit" disabled={busy}>{busy ? (fi ? 'Luodaan…' : 'Skapar…') : (fi ? 'Luo luokka' : 'Skapa klass')}</button>
    {message && <p aria-live="polite">{message}</p>}
  </form>
}

