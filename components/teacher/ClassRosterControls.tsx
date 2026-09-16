'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ClassOption = { id: string; name: string }
type Props = { classId: string; studentId: string; studentName: string; language: 'fi' | 'sv'; moveTargets: ClassOption[] }

export default function ClassRosterControls({ classId, studentId, studentName, language, moveTargets }: Props) {
  const fi = language === 'fi'
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function removeStudent() {
    if (!window.confirm(fi ? `Poistetaanko ${studentName} tästä luokasta?` : `Ta bort ${studentName} från den här klassen?`)) return
    setBusy(true); setMessage('')
    const response = await fetch(`/api/teacher/classes/${classId}/members/${studentId}`, { method: 'DELETE' })
    const data = await response.json() as { error?: string }
    if (response.ok) { router.refresh(); return }
    setMessage(data.error ?? (fi ? 'Poistaminen epäonnistui.' : 'Det gick inte att ta bort studeranden.'))
    setBusy(false)
  }

  async function moveStudent(targetClassId: string) {
    if (!targetClassId) return
    setBusy(true); setMessage('')
    const response = await fetch(`/api/teacher/classes/${classId}/members/${studentId}/move`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ targetClassId }),
    })
    const data = await response.json() as { error?: string }
    if (response.ok) { router.refresh(); return }
    setMessage(data.error ?? (fi ? 'Siirtäminen epäonnistui.' : 'Det gick inte att flytta studeranden.'))
    setBusy(false)
  }

  return <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
    {moveTargets.length > 0 && <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span>{fi ? 'Siirrä luokkaan' : 'Flytta till klass'}</span>
      <select disabled={busy} defaultValue="" onChange={e => { const value = e.currentTarget.value; if (value) void moveStudent(value) }}>
        <option value="">{fi ? 'Valitse…' : 'Välj…'}</option>
        {moveTargets.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </label>}
    <button type="button" disabled={busy} onClick={removeStudent}>{fi ? 'Poista luokasta' : 'Ta bort från klassen'}</button>
    {message && <span aria-live="polite">{message}</span>}
  </div>
}

