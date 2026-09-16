'use client'

import { useEffect, useState } from 'react'
import { CalendarClock, Globe2, Send } from 'lucide-react'
import type { DailyLessonAudience, DailyLessonSkill } from '@/types/daily-lessons'

type TeacherClass = { id: string; name: string; join_code: string }

export function TeacherLessonPublisher({ draftId }: { draftId: string }) {
  const [skill, setSkill] = useState<DailyLessonSkill>('mixed')
  const [audience, setAudience] = useState<DailyLessonAudience>('class')
  const [targetClassId, setTargetClassId] = useState('')
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [publishAt, setPublishAt] = useState(() => {
    const date = new Date(Date.now() + 60 * 60 * 1000)
    date.setMinutes(0, 0, 0)
    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0,16)
  })
  const [reviewConfirmed, setReviewConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/teacher/classes').then(r => r.ok ? r.json() : null).then(data => setClasses(data?.items ?? [])).catch(() => undefined)
  }, [])

  async function save(action: 'publish' | 'schedule') {
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/teacher/content/publish', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ draftId, action, skill, audience, targetClassId: audience === 'class' ? targetClassId : null, publishAt: action === 'schedule' ? new Date(publishAt).toISOString() : undefined, reviewConfirmed }),
      })
      const data = await response.json() as { error?: string; message?: string }
      setMessage(response.ok ? (data.message ?? 'Tallennettu.') : (data.error ?? 'Tallennus epäonnistui.'))
    } catch { setMessage('Yhteysvirhe. Yritä uudelleen.') }
    finally { setBusy(false) }
  }

  return <section className="teacher-publish-panel">
    <div className="teacher-publish-title"><CalendarClock/><div><p className="eyebrow">TARKISTA → AJASTA → JULKAISE</p><h3>Julkaise vasta tarkistuksen jälkeen</h3></div></div>
    <div className="teacher-publish-fields">
      <label>Taito<select value={skill} onChange={event => setSkill(event.target.value as DailyLessonSkill)}>{['mixed','speaking','listening','reading','writing','understanding','vocabulary','yki-test'].map(item=><option key={item} value={item}>{{mixed:"Yhdistetyt taidot",speaking:"Puhuminen",listening:"Kuuntelu",reading:"Lukeminen",writing:"Kirjoittaminen",understanding:"Ymmärtäminen",vocabulary:"Sanasto","yki-test":"YKI-harjoittelu"}[item]}</option>)}</select></label>
      <label>Kohderyhmä<select value={audience} onChange={event => setAudience(event.target.value as DailyLessonAudience)}><option value="public">Kaikki oppijat</option><option value="class">Oma luokka</option></select></label>
      {audience === 'class' && <label>Luokka<select value={targetClassId} onChange={event => setTargetClassId(event.target.value)}><option value="">Valitse luokka</option>{classes.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
      <label>Ajastettu julkaisu<input type="datetime-local" value={publishAt} onChange={event => setPublishAt(event.target.value)} /></label>
    </div>
    <label className="teacher-review-confirm"><input type="checkbox" checked={reviewConfirmed} onChange={event => setReviewConfirmed(event.target.checked)}/><span><strong>Olen tarkistanut oppitunnin.</strong><small>Tarkistin oikeellisuuden, ikätason, tehtävät ja julkaisuoikeudet.</small></span></label>
    <div className="teacher-publish-actions">
      <button type="button" disabled={busy || !reviewConfirmed || (audience === 'class' && !targetClassId)} onClick={() => save('schedule')}><CalendarClock size={17}/> Ajasta</button>
      <button type="button" className="teacher-publish-now" disabled={busy || !reviewConfirmed || (audience === 'class' && !targetClassId)} onClick={() => save('publish')}><Globe2 size={17}/> Julkaise nyt</button>
    </div>
    {message && <p aria-live="polite" className="teacher-content-message"><Send size={15}/> {message}</p>}
  </section>
}
