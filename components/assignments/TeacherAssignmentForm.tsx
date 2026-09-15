'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TeacherAssignmentForm({ classId, language, defaultLevel }: { classId: string; language: 'fi' | 'sv'; defaultLevel?: string }) {
  const router = useRouter()
  const fi = language === 'fi'
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setMessage('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/teacher/assignments', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        classId,
        title: form.get('title'),
        instructions: form.get('instructions'),
        lessonPath: form.get('lessonPath'),
        cefrLevel: form.get('cefrLevel'),
        dueAt: form.get('dueAt'),
      }),
    })
    const body = await response.json() as { error?: string; item?: { id: string } }
    setBusy(false)
    if (!response.ok) { setMessage(body.error ?? (fi ? 'Tehtävän luonti epäonnistui.' : 'Det gick inte att skapa uppgiften.')); return }
    event.currentTarget.reset()
    setMessage(fi ? 'Tehtävä luotiin.' : 'Uppgiften skapades.')
    router.refresh()
  }

  return <form className="student-register-form" onSubmit={submit} style={{marginTop:16}}>
    <div className="student-register-columns">
      <label>{fi ? 'Tehtävän nimi' : 'Uppgiftens namn'}<input name="title" required minLength={2} maxLength={160} /></label>
      <label>{fi ? 'Taso' : 'Nivå'}<select name="cefrLevel" defaultValue={defaultLevel ?? 'A0'}>{['A0','A1','A2','B1','B2','C1','C2'].map(level => <option key={level}>{level}</option>)}</select></label>
      <label>{fi ? 'Oppitunnin polku (valinnainen)' : 'Lektionslänk (valfri)'}<input name="lessonPath" placeholder={language === 'fi' ? '/levels/a1/reading' : '/course/sv/levels/a1/reading'} /></label>
      <label>{fi ? 'Määräaika (valinnainen)' : 'Deadline (valfri)'}<input name="dueAt" type="datetime-local" /></label>
    </div>
    <label>{fi ? 'Ohjeet' : 'Instruktioner'}<textarea name="instructions" rows={4} maxLength={8000} /></label>
    <button className="primary-button" type="submit" disabled={busy}>{busy ? (fi ? 'Tallennetaan…' : 'Sparar…') : (fi ? 'Luo tehtävä' : 'Skapa uppgift')}</button>
    {message && <p aria-live="polite">{message}</p>}
  </form>
}

