'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TeacherFeedbackForm({ submissionId, language, initialScore, initialFeedback }: { submissionId: string; language: 'fi' | 'sv'; initialScore?: number | null; initialFeedback?: string | null }) {
  const router=useRouter(); const fi=language==='fi'; const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false)
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setMessage('')
    const form=new FormData(event.currentTarget); const rawScore=String(form.get('score')??'').trim()
    const response=await fetch('/api/teacher/assignments/feedback',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({submissionId,score:rawScore===''?null:Number(rawScore),feedback:form.get('feedback')})})
    const body=await response.json() as {error?:string}; setBusy(false)
    if(!response.ok){setMessage(body.error??(fi?'Palautteen tallennus epäonnistui.':'Det gick inte att spara återkopplingen.'));return}
    setMessage(fi?'Palaute tallennettiin.':'Återkopplingen sparades.');router.refresh()
  }
  return <form className="student-register-form" onSubmit={submit} style={{marginTop:12}}>
    <div className="student-register-columns"><label>{fi?'Pisteet 0–100':'Poäng 0–100'}<input name="score" type="number" min="0" max="100" defaultValue={initialScore ?? ''}/></label></div>
    <label>{fi?'Opettajan palaute':'Lärarens återkoppling'}<textarea name="feedback" rows={4} maxLength={8000} defaultValue={initialFeedback ?? ''}/></label>
    <button className="primary-button" disabled={busy}>{busy?(fi?'Tallennetaan…':'Sparar…'):(fi?'Tallenna palaute':'Spara återkoppling')}</button>
    {message&&<p aria-live="polite">{message}</p>}
  </form>
}

