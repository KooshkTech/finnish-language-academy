'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClassInvitationForm({ classId, language }: { classId:string; language:'fi'|'sv' }){
  const fi=language==='fi';const router=useRouter();const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [link,setLink]=useState('')
  async function create(formData:FormData){setBusy(true);setMessage('');setLink('');const username=String(formData.get('username')??'').trim();const response=await fetch(`/api/teacher/classes/${classId}/invitations`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:username||undefined})});const data=await response.json() as {error?:string;invitePath?:string};setBusy(false);if(!response.ok){setMessage(data.error??(fi?'Kutsun luonti epäonnistui.':'Det gick inte att skapa inbjudan.'));return}if(data.invitePath){const absolute=`${window.location.origin}${data.invitePath}`;setLink(absolute);try{await navigator.clipboard.writeText(absolute);setMessage(fi?'Kutsulinkki luotu ja kopioitu.':'Inbjudningslänken skapades och kopierades.')}catch{setMessage(fi?'Kutsulinkki luotu.':'Inbjudningslänken skapades.')}}router.refresh()}
  return <form action={create} className="teacher-dashboard-card" style={{display:'grid',gap:10}}><h3>{fi?'Kutsu opiskelija':'Bjud in studerande'}</h3><p>{fi?'Voit kohdistaa kutsun käyttäjänimelle tai jättää kentän tyhjäksi ja jakaa linkin itse.':'Du kan rikta inbjudan till ett användarnamn eller lämna fältet tomt och dela länken själv.'}</p><label>{fi?'Käyttäjänimi (valinnainen)':'Användarnamn (valfritt)'}<input name="username" maxLength={80}/></label><button disabled={busy} type="submit">{busy?(fi?'Luodaan…':'Skapar…'):(fi?'Luo kutsulinkki':'Skapa inbjudningslänk')}</button>{link?<input readOnly value={link} aria-label={fi?'Kutsulinkki':'Inbjudningslänk'} onFocus={e=>e.currentTarget.select()}/>:null}{message?<p aria-live="polite">{message}</p>:null}</form>
}

