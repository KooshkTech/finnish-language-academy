'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClassFeedPostForm({classId,language}:{classId:string;language:'fi'|'sv'}){
  const fi=language==='fi';const router=useRouter();const [busy,setBusy]=useState(false);const [message,setMessage]=useState('')
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setMessage('');const form=new FormData(event.currentTarget);const response=await fetch(`/api/teacher/classes/${classId}/feed`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:form.get('title'),body:form.get('body'),linkPath:form.get('linkPath'),isPinned:form.get('isPinned')==='on',commentsEnabled:form.get('commentsEnabled')==='on'})});const payload=await response.json() as {error?:string};setBusy(false);if(!response.ok){setMessage(payload.error??(fi?'Julkaisu epäonnistui.':'Publiceringen misslyckades.'));return}event.currentTarget.reset();setMessage(fi?'Julkaistu luokan syötteeseen.':'Publicerat i klassflödet.');router.refresh()}
  return <form onSubmit={submit} className="teacher-dashboard-card" style={{display:'grid',gap:10}}><h3>{fi?'Uusi syötejulkaisu':'Nytt flödesinlägg'}</h3><label>{fi?'Otsikko':'Rubrik'}<input name="title" minLength={2} maxLength={180} required/></label><label>{fi?'Sisältö':'Innehåll'}<textarea name="body" rows={4} maxLength={4000} required/></label><label>{fi?'Sisäinen linkki (valinnainen)':'Intern länk (valfri)'}<input name="linkPath" placeholder="/student/classes/…" maxLength={500}/></label><label><input name="isPinned" type="checkbox"/> {fi?'Kiinnitä julkaisu':'Fäst inlägget'}</label><label><input name="commentsEnabled" type="checkbox" defaultChecked/> {fi?'Salli kommentit':'Tillåt kommentarer'}</label><button disabled={busy}>{busy?(fi?'Julkaistaan…':'Publicerar…'):(fi?'Julkaise':'Publicera')}</button>{message?<p role="status">{message}</p>:null}</form>
}


