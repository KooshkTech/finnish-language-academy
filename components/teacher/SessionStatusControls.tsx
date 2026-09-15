'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export default function SessionStatusControls({classId,sessionId,status,language}:{classId:string;sessionId:string;status:'scheduled'|'completed'|'cancelled';language:'fi'|'sv'}){
 const fi=language==='fi';const router=useRouter();const[busy,setBusy]=useState(false);const[message,setMessage]=useState('')
 async function update(next:'scheduled'|'completed'|'cancelled'){setBusy(true);setMessage('');const r=await fetch(`/api/teacher/classes/${classId}/sessions/${sessionId}/status`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({status:next})});const p=await r.json() as {error?:string};if(!r.ok)setMessage(p.error??(fi?'Tilan päivitys epäonnistui.':'Statusuppdateringen misslyckades.'));else router.refresh();setBusy(false)}
 return <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>{status!=='completed'?<button disabled={busy} onClick={()=>update('completed')}>{fi?'Merkitse päättyneeksi':'Markera som avslutad'}</button>:null}{status!=='cancelled'?<button disabled={busy} onClick={()=>update('cancelled')}>{fi?'Peru tunti':'Ställ in lektionen'}</button>:null}{status!=='scheduled'?<button disabled={busy} onClick={()=>update('scheduled')}>{fi?'Palauta ajastetuksi':'Återställ som schemalagd'}</button>:null}{message?<span role="status">{message}</span>:null}</div>
}

