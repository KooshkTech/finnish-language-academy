'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClassAnnouncementForm({ classId, language }: { classId: string; language: 'fi'|'sv' }) {
  const fi = language === 'fi'
  const router = useRouter()
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  async function submit(formData: FormData){
    setBusy(true);setMessage('')
    const response=await fetch(`/api/teacher/classes/${classId}/announcements`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:formData.get('title'),body:formData.get('body')})})
    const data=await response.json() as {error?:string}
    setBusy(false)
    if(!response.ok){setMessage(data.error??(fi?'Ilmoituksen julkaisu epäonnistui.':'Det gick inte att publicera meddelandet.'));return}
    const form=document.getElementById('class-announcement-form') as HTMLFormElement|null;form?.reset();router.refresh()
  }
  return <form id="class-announcement-form" action={submit} className="teacher-dashboard-card" style={{display:'grid',gap:10}}>
    <h3>{fi?'Uusi luokkailmoitus':'Nytt klassmeddelande'}</h3>
    <label>{fi?'Otsikko':'Rubrik'}<input name="title" minLength={2} maxLength={180} required /></label>
    <label>{fi?'Viesti':'Meddelande'}<textarea name="body" minLength={1} maxLength={4000} required rows={4}/></label>
    <button type="submit" disabled={busy}>{busy?(fi?'Julkaistaan…':'Publicerar…'):(fi?'Julkaise luokalle':'Publicera för klassen')}</button>
    {message?<p aria-live="polite">{message}</p>:null}
  </form>
}

