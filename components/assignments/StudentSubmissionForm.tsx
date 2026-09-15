'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentSubmissionForm({ assignmentId, language, initialAnswer = '' }: { assignmentId: string; language: 'fi' | 'sv'; initialAnswer?: string }) {
  const router = useRouter(); const fi = language === 'fi'
  const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false)
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); setBusy(true); setMessage('')
    const form=new FormData(event.currentTarget)
    const response=await fetch('/api/student/assignments/submit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({assignmentId,answerText:form.get('answerText')})})
    const body=await response.json() as {error?:string}
    setBusy(false)
    if(!response.ok){setMessage(body.error ?? (fi?'Palautus epäonnistui.':'Inlämningen misslyckades.'));return}
    setMessage(fi?'Tehtävä palautettiin opettajalle.':'Uppgiften lämnades in till läraren.')
    router.refresh()
  }
  return <form className="student-register-form" onSubmit={submit}>
    <label>{fi?'Vastauksesi':'Ditt svar'}<textarea name="answerText" rows={8} maxLength={12000} defaultValue={initialAnswer} required /></label>
    <button className="primary-button" disabled={busy}>{busy?(fi?'Lähetetään…':'Skickar…'):(fi?'Palauta tehtävä':'Lämna in uppgift')}</button>
    {message&&<p aria-live="polite">{message}</p>}
  </form>
}

