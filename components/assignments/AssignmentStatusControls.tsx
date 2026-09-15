'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
export default function AssignmentStatusControls({assignmentId,status,language}:{assignmentId:string;status:string;language:'fi'|'sv'}){
  const fi=language==='fi';const router=useRouter();const[busy,setBusy]=useState(false);const[message,setMessage]=useState('')
  async function change(next:string){setBusy(true);setMessage('');const r=await fetch('/api/teacher/assignments/status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({assignmentId,status:next})});const b=await r.json() as {error?:string};setBusy(false);if(!r.ok){setMessage(b.error??(fi?'Päivitys epäonnistui.':'Uppdateringen misslyckades.'));return}router.refresh()}
  const label=status==='active'?(fi?'Avoin':'Öppen'):status==='closed'?(fi?'Suljettu':'Stängd'):(fi?'Arkistoitu':'Arkiverad')
  return <div className="card" style={{marginTop:16}}><strong>{fi?'Tehtävän tila':'Uppgiftens status'}: {label}</strong><div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>{status!=='active'&&<button type="button" className="secondary-button" disabled={busy} onClick={()=>change('active')}>{fi?'Avaa uudelleen':'Öppna igen'}</button>}{status!=='closed'&&<button type="button" className="secondary-button" disabled={busy} onClick={()=>change('closed')}>{fi?'Sulje':'Stäng'}</button>}{status!=='archived'&&<button type="button" className="secondary-button" disabled={busy} onClick={()=>change('archived')}>{fi?'Arkistoi':'Arkivera'}</button>}</div>{message&&<p aria-live="polite">{message}</p>}</div>
}

