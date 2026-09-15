'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InvitationAcceptButton({token,language}:{token:string;language:'fi'|'sv'}){
  const fi=language==='fi';const router=useRouter();const [busy,setBusy]=useState(false);const [message,setMessage]=useState('')
  async function accept(){setBusy(true);setMessage('');const response=await fetch(`/api/student/class-invitations/${token}/accept`,{method:'POST'});const data=await response.json() as {error?:string;classId?:string};setBusy(false);if(!response.ok){setMessage(data.error??(fi?'Liittyminen epäonnistui.':'Det gick inte att gå med.'));return}router.replace(data.classId?`/student/classes/${data.classId}`:'/student');router.refresh()}
  return <div style={{display:'grid',gap:10}}><button type="button" onClick={accept} disabled={busy}>{busy?(fi?'Liitytään…':'Ansluter…'):(fi?'Hyväksy kutsu ja liity luokkaan':'Acceptera inbjudan och gå med')}</button>{message?<p aria-live="polite">{message}</p>:null}</div>
}

