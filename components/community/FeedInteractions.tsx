'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FeedInteractions({classId,postId,language,liked,likes,commentsEnabled}:{classId:string;postId:string;language:'fi'|'sv';liked:boolean;likes:number;commentsEnabled:boolean}){
  const fi=language==='fi';const router=useRouter();const [busy,setBusy]=useState(false);const [message,setMessage]=useState('')
  async function react(){setBusy(true);await fetch(`/api/student/classes/${classId}/feed/${postId}/reaction`,{method:'POST'});setBusy(false);router.refresh()}
  async function comment(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setMessage('');const form=new FormData(event.currentTarget);const response=await fetch(`/api/student/classes/${classId}/feed/${postId}/comments`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({body:form.get('body')})});const payload=await response.json() as {error?:string};setBusy(false);if(!response.ok){setMessage(payload.error??(fi?'Kommentointi epäonnistui.':'Kommentaren misslyckades.'));return}event.currentTarget.reset();router.refresh()}
  return <div style={{display:'grid',gap:10,marginTop:12}}><button type="button" onClick={react} disabled={busy} aria-pressed={liked}>{liked?'♥':'♡'} {likes}</button>{commentsEnabled?<form onSubmit={comment} style={{display:'flex',gap:8,flexWrap:'wrap'}}><input name="body" required maxLength={1000} placeholder={fi?'Kirjoita kommentti…':'Skriv en kommentar…'} style={{flex:'1 1 220px'}}/><button disabled={busy}>{fi?'Kommentoi':'Kommentera'}</button></form>:null}{message?<p role="status">{message}</p>:null}</div>
}


