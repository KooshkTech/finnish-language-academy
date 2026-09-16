'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Plus, RefreshCw, Video } from 'lucide-react'

type CalendarItem = { id:string; draft_id:string; slug:string; cefr_level:string; skill:string; title:string; status:string; audience:string; publish_at:string }
type TeacherClass = { id:string; name:string; join_code:string; created_at:string }
type LiveSession = { id:string; class_id:string; title:string; starts_at:string; ends_at:string; status:string; location_text:string|null; meeting_url:string|null; teacher_classes:{name:string|null}|{name:string|null}[]|null }

function classNameOf(value:LiveSession['teacher_classes']){return Array.isArray(value)?value[0]?.name??'':value?.name??''}

export function TeacherLessonCalendar({language}:{language:'fi'|'sv'}) {
  const fi=language==='fi'
  const [items,setItems] = useState<CalendarItem[]>([])
  const [classes,setClasses] = useState<TeacherClass[]>([])
  const [sessions,setSessions] = useState<LiveSession[]>([])
  const [busy,setBusy] = useState(false)
  const [message,setMessage] = useState('')

  const load = useCallback(async () => {
    const [calendarRes, classesRes, sessionsRes] = await Promise.all([fetch('/api/teacher/content/calendar'), fetch('/api/teacher/classes'),fetch('/api/teacher/sessions')])
    const calendar = calendarRes.ok ? await calendarRes.json() as {items?:CalendarItem[]} : {items:[]}
    const classData = classesRes.ok ? await classesRes.json() as {items?:TeacherClass[]} : {items:[]}
    const sessionData = sessionsRes.ok ? await sessionsRes.json() as {items?:LiveSession[]} : {items:[]}
    setItems(calendar.items ?? []); setClasses(classData.items ?? []); setSessions(sessionData.items??[])
  }, [])
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial remote calendar synchronization.
  useEffect(() => { void load().catch(()=>setMessage(fi?'Kalenterin tietoja ei voitu ladata.':'Kalenderdata kunde inte laddas.')) }, [load,fi])

  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('')
    const form = new FormData(event.currentTarget); const name = String(form.get('name') ?? '')
    const response = await fetch('/api/teacher/classes',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name})})
    const data = await response.json() as {error?:string}
    setMessage(response.ok ? (fi?'Luokka luotiin.':'Klassen skapades.') : (data.error ?? (fi?'Luokan luonti epäonnistui.':'Det gick inte att skapa klassen.')))
    if(response.ok) { event.currentTarget.reset(); await load() }
    setBusy(false)
  }

  async function changeStatus(draftId:string, action:'unpublish'|'archive') {
    setBusy(true)
    const response = await fetch('/api/teacher/content/publish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({draftId,action})})
    setMessage(response.ok ? (fi?'Tila päivitettiin.':'Status uppdaterades.') : (fi?'Tilan päivitys epäonnistui.':'Statusuppdateringen misslyckades.'))
    await load(); setBusy(false)
  }

  return <main className="teacher-content-page">
    <header className="teacher-settings-header"><Link href="/teacher">← {fi?'Opettajan työtila':'Lärararbetsyta'}</Link><div><p className="eyebrow">V24.16 · {fi?'KALENTERI':'KALENDER'}</p><h1>{fi?'Kalenteri':'Kalender'}</h1><p>{fi?'Näe julkaistavat oppitunnit ja luokkien live-tunnit samassa näkymässä.':'Se publicerade lektioner och klassernas livelektioner i samma vy.'}</p></div></header>
    <section className="teacher-calendar-layout">
      <div className="teacher-calendar-main">
        <div className="teacher-calendar-toolbar"><h2>{fi?'Live-tunnit':'Livelektioner'}</h2><button type="button" onClick={() => void load()}><RefreshCw size={16}/> {fi?'Päivitä':'Uppdatera'}</button></div>
        <div className="teacher-calendar-list">{sessions.length?sessions.map(session=><article key={session.id} className="teacher-calendar-item"><div className="teacher-calendar-date"><Video/><strong>{new Intl.DateTimeFormat(fi?'fi-FI':'sv-SE',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(session.starts_at))}</strong><small>{new Intl.DateTimeFormat(fi?'fi-FI':'sv-SE',{hour:'2-digit',minute:'2-digit'}).format(new Date(session.starts_at))}</small></div><div><div className="teacher-calendar-tags"><span>{classNameOf(session.teacher_classes)}</span><span>{session.status==='scheduled'?(fi?'Ajastettu':'Schemalagd'):session.status==='completed'?(fi?'Päättynyt':'Avslutad'):(fi?'Peruttu':'Inställd')}</span></div><h3>{session.title}</h3>{session.location_text?<p>{fi?'Paikka':'Plats'}: {session.location_text}</p>:null}<Link href={`/teacher/classes/${session.class_id}/sessions/${session.id}`}>{fi?'Avaa tunti ja läsnäolo':'Öppna lektion och närvaro'} →</Link></div></article>):<div className="teacher-empty-state"><p>{fi?'Ei vielä ajastettuja live-tunteja.':'Inga livelektioner är schemalagda ännu.'}</p><Link href="/teacher/classes">{fi?'Avaa luokka ja ajasta tunti':'Öppna en klass och schemalägg en lektion'} →</Link></div>}</div>
        <div className="teacher-calendar-toolbar" style={{marginTop:30}}><h2>{fi?'Julkaistavat oppitunnit':'Publicerade lektioner'}</h2></div>
        <div className="teacher-calendar-list">{items.length ? items.map(item => <article key={item.id} className="teacher-calendar-item"><div className="teacher-calendar-date"><CalendarDays/><strong>{new Intl.DateTimeFormat(fi?'fi-FI':'sv-SE',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(item.publish_at))}</strong><small>{new Intl.DateTimeFormat(fi?'fi-FI':'sv-SE',{hour:'2-digit',minute:'2-digit'}).format(new Date(item.publish_at))}</small></div><div><div className="teacher-calendar-tags"><span>{item.cefr_level}</span><span>{item.skill}</span><span>{item.audience}</span><span className={`teacher-status-${item.status}`}>{item.status}</span></div><h3>{item.title}</h3><Link href={`/daily-lessons/${item.slug}`}>{fi?'Oppijan esikatselu':'Förhandsgranska'} →</Link></div><div className="teacher-calendar-actions"><button disabled={busy} onClick={() => changeStatus(item.draft_id,'unpublish')}>{fi?'Poista näkyvistä':'Dölj'}</button><button disabled={busy} onClick={() => changeStatus(item.draft_id,'archive')}>{fi?'Arkistoi':'Arkivera'}</button></div></article>) : <div className="teacher-empty-state"><p>{fi?'Ei vielä ajastettuja oppitunteja.':'Inga lektioner är schemalagda ännu.'}</p><Link href="/teacher/content-studio">{fi?'Luo ensimmäinen oppitunti':'Skapa första lektionen'} →</Link></div>}</div>
      </div>
      <aside className="teacher-class-panel"><h2>{fi?'Luokat':'Klasser'}</h2><p>{fi?'Avaa luokka ajastaaksesi live-tunnin ja merkitäksesi läsnäolon.':'Öppna en klass för att schemalägga livelektion och markera närvaro.'}</p><form onSubmit={createClass}><label>{fi?'Luokan nimi':'Klassnamn'}<input name="name" minLength={2} maxLength={120} required placeholder={fi?'Esim. Suomi B1 – syksy':'T.ex. Svenska B1 – höst'}/></label><button disabled={busy} type="submit"><Plus size={16}/> {fi?'Luo luokka':'Skapa klass'}</button></form>{message && <p>{message}</p>}<div className="teacher-class-list">{classes.map(item=><div key={item.id}><strong>{item.name}</strong><small>{fi?'Liittymiskoodi':'Anslutningskod'}: {item.join_code}</small><Link href={`/teacher/classes/${item.id}`}>{fi?'Avaa':'Öppna'} →</Link></div>)}</div></aside>
    </section>
  </main>
}

