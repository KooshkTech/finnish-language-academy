'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

type CourseLanguage = 'fi' | 'sv'

export default function PasswordResetForm({ courseLanguage }: { courseLanguage: CourseLanguage }) {
  const fi = courseLanguage === 'fi'
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') ?? '')
    const confirmation = String(form.get('passwordConfirm') ?? '')
    if (password.length < 10) {
      setMessage(fi ? 'Salasanassa pitää olla vähintään 10 merkkiä.' : 'Lösenordet måste ha minst 10 tecken.')
      return
    }
    if (password !== confirmation) {
      setMessage(fi ? 'Salasanat eivät täsmää.' : 'Lösenorden stämmer inte överens.')
      return
    }
    if (!isSupabaseConfigured()) {
      setMessage(fi ? 'Salasanan vaihto ei ole vielä tuotantokonfiguroitu.' : 'Lösenordsbytet är ännu inte produktionskonfigurerat.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        setMessage(fi ? 'Palautuslinkki on vanhentunut tai istunto puuttuu. Pyydä uusi linkki.' : 'Återställningslänken har gått ut eller sessionen saknas. Begär en ny länk.')
        return
      }
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setMessage(fi ? 'Salasanan vaihtaminen epäonnistui. Pyydä tarvittaessa uusi palautuslinkki.' : 'Det gick inte att byta lösenord. Begär en ny återställningslänk vid behov.')
        return
      }
      setSuccess(true)
      setMessage(fi ? 'Salasana vaihdettiin. Voit nyt kirjautua uudella salasanalla.' : 'Lösenordet har ändrats. Du kan nu logga in med det nya lösenordet.')
    } catch {
      setMessage(fi ? 'Yhteysvirhe. Yritä uudelleen.' : 'Anslutningsfel. Försök igen.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="student-register-shell">
    <header className="student-register-header">
      <Link href={`/course/${courseLanguage}`}>{fi ? '← Kirjautumiseen' : '← Till inloggningen'}</Link>
      <div>
        <p className="eyebrow">{fi ? 'UUSI SALASANA' : 'NYTT LÖSENORD'}</p>
        <h1>{fi ? 'Aseta uusi salasana' : 'Ange ett nytt lösenord'}</h1>
      </div>
    </header>
    <form className="student-register-form" onSubmit={submit}>
      <div className="student-register-columns">
        <label>{fi ? 'Uusi salasana' : 'Nytt lösenord'}<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label>
        <label>{fi ? 'Salasana uudelleen' : 'Bekräfta lösenord'}<input name="passwordConfirm" type="password" autoComplete="new-password" minLength={10} required /></label>
      </div>
      <button type="submit" className="primary-button" disabled={busy || success}>{busy ? (fi ? 'Tallennetaan…' : 'Sparar…') : success ? (fi ? 'Salasana vaihdettu' : 'Lösenordet ändrat') : (fi ? 'Vaihda salasana' : 'Byt lösenord')}</button>
      {message && <p className={`student-register-message ${success ? 'success' : ''}`} aria-live="polite">{message}</p>}
    </form>
  </main>
}

