'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { classId: string; joinCode: string; language: 'fi' | 'sv' }

export default function ClassJoinCodeControls({ classId, joinCode, language }: Props) {
  const fi = language === 'fi'
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(joinCode)
      setMessage(fi ? 'Koodi kopioitu.' : 'Koden kopierades.')
    } catch {
      setMessage(fi ? 'Kopiointi ei onnistunut. Valitse koodi käsin.' : 'Det gick inte att kopiera. Markera koden manuellt.')
    }
  }

  async function regenerate() {
    if (!window.confirm(fi ? 'Luodaanko uusi liittymiskoodi? Vanha koodi lakkaa toimimasta.' : 'Skapa en ny anslutningskod? Den gamla koden slutar fungera.')) return
    setBusy(true); setMessage('')
    const response = await fetch(`/api/teacher/classes/${classId}/join-code`, { method: 'POST' })
    const data = await response.json() as { error?: string }
    if (response.ok) {
      setMessage(fi ? 'Uusi liittymiskoodi luotu.' : 'En ny anslutningskod har skapats.')
      router.refresh()
    } else setMessage(data.error ?? (fi ? 'Koodin vaihto epäonnistui.' : 'Det gick inte att byta kod.'))
    setBusy(false)
  }

  return <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
    <code style={{ fontWeight: 800, fontSize: '1.05rem' }}>{joinCode}</code>
    <button type="button" onClick={copyCode}>{fi ? 'Kopioi koodi' : 'Kopiera kod'}</button>
    <button type="button" onClick={regenerate} disabled={busy}>{busy ? '…' : (fi ? 'Vaihda koodi' : 'Byt kod')}</button>
    {message && <span aria-live="polite">{message}</span>}
  </div>
}

