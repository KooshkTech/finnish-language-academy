'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UsersRound } from 'lucide-react'

export function JoinClassForm({ language = 'fi' }: { language?: 'fi' | 'sv' }) {
  const fi = language === 'fi'
  const router = useRouter()
  const [busy,setBusy] = useState(false)
  const [message,setMessage] = useState('')
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/classes/join',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:String(form.get('code') ?? '')})})
    const data = await response.json() as {error?:string;className?:string}
    if (response.ok) {
      setMessage(fi ? `Liityit luokkaan: ${data.className ?? ''}` : `Du gick med i klassen: ${data.className ?? ''}`)
      setTimeout(() => router.push('/student'), 700)
    } else setMessage(data.error ?? (fi ? 'Liittyminen epäonnistui.' : 'Det gick inte att gå med i klassen.'))
    setBusy(false)
  }
  return <main className="join-class-page"><section className="join-class-card"><Link href="/student">{fi ? '← Opiskelijan työpöytä' : '← Studentens arbetsyta'}</Link><UsersRound size={34}/><p className="eyebrow">{fi ? 'OPISKELIJAN LUOKKA' : 'STUDENTKLASS'}</p><h1>{fi ? 'Liity opettajan luokkaan' : 'Gå med i lärarens klass'}</h1><p>{fi ? 'Syötä opettajalta saamasi liittymiskoodi. Luokan tehtävät ja oppitunnit näkyvät sen jälkeen opiskelijan työpöydällä.' : 'Ange anslutningskoden som du fått av läraren. Klassens uppgifter och lektioner visas därefter på studentens arbetsyta.'}</p><form onSubmit={submit}><label>{fi ? 'Liittymiskoodi' : 'Anslutningskod'}<input name="code" autoComplete="off" minLength={6} maxLength={32} required placeholder={fi ? 'ESIM. A1B2C3D4' : 'T.EX. A1B2C3D4'} /></label><button disabled={busy} type="submit">{busy ? (fi ? 'Liitytään…' : 'Ansluter…') : (fi ? 'Liity luokkaan' : 'Gå med i klassen')}</button></form>{message && <p aria-live="polite" className="join-class-message">{message}</p>}</section></main>
}

