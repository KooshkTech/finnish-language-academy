'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

type CourseLanguage = 'fi' | 'sv'

export default function PasswordResetRequestForm({ courseLanguage }: { courseLanguage: CourseLanguage }) {
  const fi = courseLanguage === 'fi'
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim().toLowerCase()
    if (!email) return
    if (!isSupabaseConfigured()) {
      setMessage(fi ? 'Salasanan palautus ei ole vielä tuotantokonfiguroitu.' : 'Lösenordsåterställningen är ännu inte produktionskonfigurerad.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/reset-password?course=${courseLanguage}`)}`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) {
        setMessage(fi ? 'Palautusviestin lähettäminen epäonnistui. Yritä myöhemmin uudelleen.' : 'Det gick inte att skicka återställningsmeddelandet. Försök igen senare.')
        return
      }
      setSent(true)
      setMessage(fi ? 'Jos sähköpostiosoite kuuluu tilille, lähetimme siihen palautuslinkin.' : 'Om e-postadressen hör till ett konto har vi skickat en återställningslänk.')
    } catch {
      setMessage(fi ? 'Yhteysvirhe. Yritä uudelleen.' : 'Anslutningsfel. Försök igen.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="student-register-shell">
    <header className="student-register-header">
      <Link href={`/course/${courseLanguage}`}>{fi ? '← Takaisin' : '← Tillbaka'}</Link>
      <div>
        <p className="eyebrow">{fi ? 'SALASANA' : 'LÖSENORD'}</p>
        <h1>{fi ? 'Palauta salasana' : 'Återställ lösenord'}</h1>
        <p>{fi ? 'Saat sähköpostiisi turvallisen linkin uuden salasanan asettamista varten.' : 'Du får en säker länk via e-post för att ange ett nytt lösenord.'}</p>
      </div>
    </header>
    <form className="student-register-form" onSubmit={submit}>
      <label>{fi ? 'Sähköposti' : 'E-post'}<input name="email" type="email" autoComplete="email" required /></label>
      <button type="submit" className="primary-button" disabled={busy || sent}>{busy ? (fi ? 'Lähetetään…' : 'Skickar…') : sent ? (fi ? 'Linkki lähetetty' : 'Länken skickad') : (fi ? 'Lähetä palautuslinkki' : 'Skicka återställningslänk')}</button>
      {message && <p className={`student-register-message ${sent ? 'success' : ''}`} aria-live="polite">{message}</p>}
    </form>
  </main>
}

