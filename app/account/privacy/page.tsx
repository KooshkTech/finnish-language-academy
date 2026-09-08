'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function AccountPrivacyPage() {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const supabase = createClient()

  async function callAction(action: 'export' | 'delete') {
    if (!isSupabaseConfigured()) {
      setStatus('Tilipalvelu ei ole määritetty. Tietojen vienti ja tilin poisto vaativat Supabase-yhteyden.')
      return
    }
    if (action === 'delete' && !window.confirm('Poistetaanko OpiOpe-tilisi ja tilikohtainen oppimisdata pysyvästi? Tätä ei voi perua.')) return
    setBusy(true); setStatus(action === 'export' ? 'Kootaan tietojasi…' : 'Poistetaan tiliä…')
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('Kirjaudu ensin sisään.')
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL
      const response = await fetch(`${base}/functions/v1/account-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? 'Pyyntö epäonnistui.')
      if (action === 'export') {
        const blob = new Blob([JSON.stringify(payload.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url; anchor.download = 'opiope-my-data.json'; anchor.click(); URL.revokeObjectURL(url)
        setStatus('Tietosi vietiin JSON-tiedostoon.')
      } else {
        await supabase.auth.signOut()
        setStatus('Tili ja tilikohtainen oppimisdata poistettiin.')
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Pyyntö epäonnistui.')
    } finally { setBusy(false) }
  }

  return (
    <main className="legal-page">
      <div className="legal-wrap">
        <Link className="back-link" href="/">← OpiOpe</Link>
        <span className="modal-label">OMAT TIEDOT</span>
        <h1>Hallitse tietojasi</h1>
        <p className="legal-lead">Täältä voit viedä OpiOpe-tiliisi tallennetun oppimisdatan tai pyytää tilin ja tilikohtaisen datan poistamista.</p>
        <div className="privacy-action-card">
          <h2>Vie tietoni</h2><p>Lataa koneellisesti luettava JSON-kopio OpiOpeen tallennetuista tilitiedoista ja oppimisen etenemisestä.</p>
          <button className="outline-button" disabled={busy} onClick={() => callAction('export')}>Lataa tietoni</button>
        </div>
        <div className="privacy-action-card danger-card">
          <h2>Poista tilini</h2><p>Poistaa tilikohtaisen oppimisdatan ja Supabase Auth -käyttäjän. Toiminto on peruuttamaton.</p>
          <button className="danger-button" disabled={busy} onClick={() => callAction('delete')}>Poista tili ja tiedot</button>
        </div>
        {status ? <p className="auth-message" role="status">{status}</p> : null}
        <p className="legal-warning">Toiminto vaatii julkaistun <code>account-data</code> Edge Functionin. Ilman sitä käyttöliittymä näyttää virheen eikä väitä poistamisen onnistuneen.</p>
      </div>
    </main>
  )
}
