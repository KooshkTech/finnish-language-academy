'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

type CourseLanguage = 'fi' | 'sv'
type AccountKind = 'student' | 'teacher' | 'free'

export default function AccountRegistrationForm({ courseLanguage, accountKind }: { courseLanguage: CourseLanguage; accountKind: AccountKind }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const fi = courseLanguage === 'fi'
  const courseLabelFi = courseLanguage === 'fi' ? 'Suomi' : 'Ruotsi'
  const courseLabelSv = courseLanguage === 'fi' ? 'Finska' : 'Svenska'

  const roleLabel = fi
    ? accountKind === 'teacher' ? 'opettajatili' : accountKind === 'free' ? 'vapaa tili' : 'opiskelijatili'
    : accountKind === 'teacher' ? 'lärarkonto' : accountKind === 'free' ? 'fritt konto' : 'studentkonto'

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const username = String(form.get('username') ?? '').trim().toLowerCase()
    const displayName = String(form.get('displayName') ?? '').trim()
    const email = String(form.get('email') ?? '').trim().toLowerCase()
    const password = String(form.get('password') ?? '')
    const passwordConfirm = String(form.get('passwordConfirm') ?? '')
    const accepted = form.get('terms') === 'on'

    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      setMessage(fi ? 'Käyttäjätunnuksessa saa olla 3–32 merkkiä.' : 'Användarnamnet ska ha 3–32 tecken.')
      return
    }
    if (password.length < 10) { setMessage(fi ? 'Salasanassa pitää olla vähintään 10 merkkiä.' : 'Lösenordet måste ha minst 10 tecken.'); return }
    if (password !== passwordConfirm) { setMessage(fi ? 'Salasanat eivät täsmää.' : 'Lösenorden stämmer inte överens.'); return }
    if (!accepted) { setMessage(fi ? 'Hyväksy käyttöehdot ja tietosuojaseloste.' : 'Godkänn användarvillkoren och dataskyddsbeskrivningen.'); return }
    if (!isSupabaseConfigured()) { setMessage(fi ? 'Rekisteröinti ei ole vielä tuotantokonfiguroitu.' : 'Registreringen är ännu inte produktionskonfigurerad.'); return }

    setBusy(true)
    setMessage(fi ? 'Luodaan tili…' : 'Skapar konto…')
    try {
      const supabase = createClient()
      const redirectPath = accountKind === 'teacher' ? '/teacher/application' : accountKind === 'free' ? `/course/${courseLanguage}/levels` : '/student'
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
          data: {
            username,
            display_name: displayName || username,
            course_language: courseLanguage,
            account_mode: accountKind,
            requested_role: accountKind === 'teacher' ? 'teacher' : 'student',
          },
        },
      })
      if (error) {
        setMessage(fi ? 'Tilin luominen epäonnistui. Tarkista tiedot ja yritä uudelleen.' : 'Kontot kunde inte skapas. Kontrollera uppgifterna och försök igen.')
        return
      }
      setSuccess(true)
      if (data.session) {
        window.location.assign(redirectPath)
        return
      }
      if (accountKind === 'teacher') {
        setMessage(fi ? 'Opettajatili luotiin hakemuksena. Vahvista sähköpostisi. Opettajan oikeudet aktivoidaan hyväksynnän jälkeen.' : 'Lärarkontot skapades som en ansökan. Bekräfta din e-post. Lärarbehörighet aktiveras efter godkännande.')
      } else {
        setMessage(fi ? 'Tili luotiin. Vahvista sähköpostiosoitteesi.' : 'Kontot skapades. Bekräfta din e-postadress.')
      }
    } catch {
      setMessage(fi ? 'Yhteysvirhe. Yritä uudelleen.' : 'Anslutningsfel. Försök igen.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="student-register-shell">
    <header className="student-register-header">
      <Link href={`/course/${courseLanguage}`}>{fi ? '← Takaisin' : '← Tillbaka'}</Link>
      <div><p className="eyebrow">{roleLabel.toUpperCase()}</p><h1>{fi ? `Luo ${roleLabel}` : `Skapa ${roleLabel}`}</h1><p>{fi ? `Valittu kurssi: ${courseLabelFi}` : `Vald kurs: ${courseLabelSv}`}</p></div>
    </header>
    <form className="student-register-form" onSubmit={register}>
      <label>{fi ? 'Käyttäjätunnus' : 'Användarnamn'}<input name="username" autoComplete="username" minLength={3} maxLength={32} required /></label>
      <label>{fi ? 'Nimi tai kutsumanimi' : 'Namn eller tilltalsnamn'}<input name="displayName" autoComplete="name" maxLength={80} /></label>
      <label>{fi ? 'Sähköposti' : 'E-post'}<input name="email" type="email" autoComplete="email" required /></label>
      <div className="student-register-columns">
        <label>{fi ? 'Salasana' : 'Lösenord'}<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label>
        <label>{fi ? 'Salasana uudelleen' : 'Bekräfta lösenord'}<input name="passwordConfirm" type="password" autoComplete="new-password" minLength={10} required /></label>
      </div>
      <label className="register-check"><input type="checkbox" name="terms" required /><span>{fi ? 'Hyväksyn käyttöehdot ja olen lukenut tietosuojaselosteen.' : 'Jag godkänner användarvillkoren och har läst dataskyddsbeskrivningen.'} <Link href="/terms">{fi ? 'Käyttöehdot' : 'Användarvillkor'}</Link> · <Link href="/privacy">{fi ? 'Tietosuoja' : 'Dataskydd'}</Link></span></label>
      <button type="submit" className="primary-button" disabled={busy || success}>{busy ? (fi ? 'Luodaan tili…' : 'Skapar konto…') : success ? (fi ? 'Tili luotu' : 'Kontot skapat') : (fi ? 'Luo tili' : 'Skapa konto')}</button>
      {message && <p className={`student-register-message ${success ? 'success' : ''}`} aria-live="polite">{message}</p>}
    </form>
  </div>
}

