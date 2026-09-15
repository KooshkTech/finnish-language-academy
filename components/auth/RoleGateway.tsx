'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

type CourseLanguage = 'fi' | 'sv'
type LoginRole = 'student' | 'teacher' | 'free'

export default function RoleGateway({ courseLanguage }: { courseLanguage: CourseLanguage }) {
  const [activeRole, setActiveRole] = useState<LoginRole | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const fi = courseLanguage === 'fi'
  const courseName = fi ? 'Suomi' : 'Svenska'
  const levelHref = `/course/${courseLanguage}/levels`

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeRole) return
    const form = new FormData(event.currentTarget)
    const username = String(form.get('username') ?? '').trim()
    const password = String(form.get('password') ?? '')
    if (!username || !password) {
      setMessage(fi ? 'Anna käyttäjätunnus ja salasana.' : 'Ange användarnamn och lösenord.')
      return
    }
    setBusy(true)
    setMessage(fi ? 'Kirjaudutaan…' : 'Loggar in…')
    try {
      const response = await fetch('/api/auth/role-login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password, role: activeRole, courseLanguage }),
      })
      const data = await response.json() as { ok?: boolean; error?: string; redirectTo?: string }
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? (fi ? 'Kirjautuminen epäonnistui.' : 'Inloggningen misslyckades.'))
        return
      }
      window.location.assign(data.redirectTo ?? levelHref)
    } catch {
      setMessage(fi ? 'Yhteysvirhe. Yritä uudelleen.' : 'Anslutningsfel. Försök igen.')
    } finally {
      setBusy(false)
    }
  }

  const copy = fi ? {
    eyebrow: 'SUOMEN KURSSI', title: 'Valitse käyttäjätyyppi', body: 'Valitse opiskelija, opettaja tai vapaa käyttäjä. Kaikki jatkavat suomen kurssille tasoille A0–C2.',
    teacher: 'Opettaja', student: 'Opiskelija', free: 'Vapaa käyttäjä',
    teacherBody: 'Hallinnoi suomen kursseja, luokkia, tehtäviä, opiskelijoita ja oppitunteja.',
    studentBody: 'Opiskele omaa A0–C2-polkuasi ja tallenna edistymisesi.',
    freeBody: 'Kokeile suomen kurssia vapaasti tai luo ilmainen tili edistymisen tallentamista varten.',
    login: 'Kirjaudu', create: 'Luo tili', continueFree: 'Jatka ilman tiliä', levels: 'Näytä A0–C2-tasot', back: '← Vaihda kieli', username: 'Käyttäjätunnus', password: 'Salasana', forgot: 'Unohtuiko salasana?',
  } : {
    eyebrow: 'SVENSKAKURS', title: 'Välj användartyp', body: 'Välj studerande, lärare eller fri användare. Alla fortsätter till svenskakursens nivåer A0–C2.',
    teacher: 'Lärare', student: 'Studerande', free: 'Fri användare',
    teacherBody: 'Hantera svenskakurser, klasser, uppgifter, studerande och lektioner.',
    studentBody: 'Studera på din egen A0–C2-stig och spara dina framsteg.',
    freeBody: 'Prova svenskakursen fritt eller skapa ett gratis konto för att spara framsteg.',
    login: 'Logga in', create: 'Skapa konto', continueFree: 'Fortsätt utan konto', levels: 'Visa nivåerna A0–C2', back: '← Byt språk', username: 'Användarnamn', password: 'Lösenord', forgot: 'Glömt lösenordet?',
  }

  return <main className="role-gateway">
    <header className="role-gateway-header">
      <div className="role-brand"><span>OO</span><strong>OpiOpe</strong></div>
      <Link href="/">{copy.back}</Link>
    </header>
    <section className="role-gateway-hero">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{courseName}: A0–C2</h1>
      <p>{copy.body}</p>
      <Link className="role-guest-button" href={levelHref}>{copy.levels} →</Link>
    </section>

    <section className="role-choice-grid" aria-label={copy.title}>
      {([
        ['teacher', copy.teacher, copy.teacherBody, '01'],
        ['student', copy.student, copy.studentBody, '02'],
        ['free', copy.free, copy.freeBody, '03'],
      ] as const).map(([role, title, body, no]) => <button key={role} type="button" className={`role-choice-card ${activeRole === role ? 'is-active' : ''}`} onClick={() => { setActiveRole(role); setMessage('') }}>
        <span className="role-icon" aria-hidden="true">{role === 'teacher' ? '✎' : role === 'student' ? '◎' : '↗'}</span>
        <small>{no}</small><h2>{title}</h2><p>{body}</p><strong>{copy.login} →</strong>
      </button>)}
    </section>

    {activeRole && <section className="role-login-panel" aria-live="polite">
      <div>
        <p className="eyebrow">{activeRole === 'teacher' ? copy.teacher : activeRole === 'student' ? copy.student : copy.free}</p>
        <h2>{copy.login}</h2>
        <p><Link href={`/register/${activeRole}?course=${courseLanguage}`}>{copy.create} →</Link></p>
        {activeRole === 'free' && <p><Link href={levelHref}>{copy.continueFree} →</Link></p>}
      </div>
      <form onSubmit={login}>
        <label>{copy.username}<input name="username" autoComplete="username" required /></label>
        <label>{copy.password}<input name="password" type="password" autoComplete="current-password" required /></label>
        <p><Link href={`/forgot-password?course=${courseLanguage}`}>{copy.forgot}</Link></p>
        <button type="submit" disabled={busy}>{busy ? (fi ? 'Kirjaudutaan…' : 'Loggar in…') : copy.login}</button>
        {message && <p className="role-login-message">{message}</p>}
      </form>
    </section>}
  </main>
}

