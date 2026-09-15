'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClassMessageComposer({ endpoint, language, extraBody = {} }: { endpoint:string; language:'fi'|'sv'; extraBody?: Record<string,string> }){
  const fi=language==='fi';const router=useRouter();const [busy,setBusy]=useState(false);const [message,setMessage]=useState('')
  async function send(formData:FormData){setBusy(true);setMessage('');const body=String(formData.get('body')??'').trim();const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({body,...extraBody})});const data=await response.json() as {error?:string};setBusy(false);if(!response.ok){setMessage(data.error??(fi?'Viestin lähetys epäonnistui.':'Det gick inte att skicka meddelandet.'));return}const form=document.getElementById(`message-form-${endpoint.replace(/\W/g,'-')}`) as HTMLFormElement|null;form?.reset();router.refresh()}
  return <form id={`message-form-${endpoint.replace(/\W/g,'-')}`} action={send} style={{display:'grid',gap:10}}><label>{fi?'Viesti':'Meddelande'}<textarea name="body" required minLength={1} maxLength={4000} rows={4}/></label><button type="submit" disabled={busy}>{busy?(fi?'Lähetetään…':'Skickar…'):(fi?'Lähetä viesti':'Skicka meddelande')}</button>{message?<p aria-live="polite">{message}</p>:null}</form>
}

