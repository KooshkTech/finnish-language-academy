'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function StudentRegistrationForm() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const username = String(form.get('username') ?? '').trim().toLowerCase()
    const displayName = String(form.get('displayName') ?? '').trim()
    const email = String(form.get('email') ?? '').trim().toLowerCase()
    const password = String(form.get('password') ?? '')
    const passwordConfirm = String(form.get('passwordConfirm') ?? '')
    const ageBasis = String(form.get('ageBasis') ?? '')
    const accepted = form.get('terms') === 'on'

    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      setMessage('Käyttäjätunnuksessa saa olla 3–32 merkkiä: a–z, 0–9, piste, alaviiva tai viiva.')
      return
    }
    if (password.length < 10) { setMessage('Salasanassa pitää olla vähintään 10 merkkiä.'); return }
    if (password !== passwordConfirm) { setMessage('Salasanat eivät täsmää.'); return }
    if (!ageBasis) { setMessage('Valitse ikään tai huoltajan lupaan liittyvä vaihtoehto.'); return }
    if (!accepted) { setMessage('Hyväksy käyttöehdot ja tietosuojaseloste ennen tilin luomista.'); return }
    if (!isSupabaseConfigured()) { setMessage('Rekisteröinti ei ole vielä tuotantokonfiguroitu. Vapaa käyttäjä voi silti jatkaa ilman tiliä.'); return }

    setBusy(true)
    setMessage('Luodaan tili…')
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=/student`
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { username, display_name: displayName || username, age_basis: ageBasis },
        },
      })
      if (error) {
        setMessage(error.message.toLowerCase().includes('database') ? 'Käyttäjätunnus voi olla jo käytössä. Kokeile toista tunnusta.' : 'Tilin luominen epäonnistui. Tarkista tiedot ja yritä uudelleen.')
        return
      }
      setSuccess(true)
      setMessage(data.session ? 'Tili luotiin. Siirryt opiskelijan työpöydälle.' : 'Tili luotiin. Tarkista sähköpostisi ja vahvista osoite ennen kirjautumista.')
    } catch {
      setMessage('Yhteysvirhe. Yritä uudelleen.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="student-register-shell">
    <header className="student-register-header">
      <Link href="/">← OpiOpe</Link>
      <div><p className="eyebrow">OPISKELIJATILI</p><h1>Luo oma oppimispolku.</h1><p>Tilin avulla edistyminen, oppitunnit ja kertaukset voidaan synkronoida turvallisesti eri laitteille.</p></div>
    </header>
    <form className="student-register-form" onSubmit={register}>
      <label>Käyttäjätunnus<input name="username" autoComplete="username" minLength={3} maxLength={32} required placeholder="esim. maria.92" /></label>
      <label>Nimi tai kutsumanimi<input name="displayName" autoComplete="name" maxLength={80} placeholder="Miten haluat OpiOpen puhuttelevan sinua?" /></label>
      <label>Sähköposti<input name="email" type="email" autoComplete="email" required /></label>
      <div className="student-register-columns">
        <label>Salasana<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label>
        <label>Salasana uudelleen<input name="passwordConfirm" type="password" autoComplete="new-password" minLength={10} required /></label>
      </div>
      <fieldset>
        <legend>Tilin käyttö</legend>
        <label className="register-check"><input type="radio" name="ageBasis" value="13plus" required /><span>Olen vähintään 13-vuotias.</span></label>
        <label className="register-check"><input type="radio" name="ageBasis" value="guardian" required /><span>Huoltajani on hyväksynyt tämän tilin käytön.</span></label>
      </fieldset>
      <label className="register-check"><input type="checkbox" name="terms" required /><span>Hyväksyn <Link href="/terms">käyttöehdot</Link> ja olen lukenut <Link href="/privacy">tietosuojaselosteen</Link>.</span></label>
      <button type="submit" className="primary-button" disabled={busy || success}>{busy ? 'Luodaan tili…' : success ? 'Tili luotu' : 'Luo opiskelijatili'}</button>
      {message && <p className={`student-register-message ${success ? 'success' : ''}`} aria-live="polite">{message}</p>}
      <p className="student-register-alt">Onko sinulla jo tili? <Link href="/?login=student">Palaa kirjautumiseen</Link>. Voit myös <Link href="/learn">jatkaa ilman tiliä</Link>.</p>
    </form>
  </div>
}

