'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WeeklyGoalForm({language,minutes,lessons}:{language:'fi'|'sv';minutes:number;lessons:number}){const fi=language==='fi';const router=useRouter();const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);const form=new FormData(event.currentTarget);const response=await fetch('/api/student/learning-path/weekly-goal',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({targetMinutes:Number(form.get('minutes')),targetLessons:Number(form.get('lessons'))})});setBusy(false);setMessage(response.ok?(fi?'Viikkotavoite tallennettu.':'Veckomålet sparades.'):(fi?'Tallennus epäonnistui.':'Det gick inte att spara.'));if(response.ok)router.refresh()}return <form onSubmit={submit} className="teacher-dashboard-card" style={{display:'grid',gap:10}}><h3>{fi?'Viikkotavoite':'Veckomål'}</h3><label>{fi?'Minuuttia':'Minuter'}<input name="minutes" type="number" min={10} max={1400} defaultValue={minutes}/></label><label>{fi?'Oppituntia':'Lektioner'}<input name="lessons" type="number" min={1} max={50} defaultValue={lessons}/></label><button disabled={busy}>{fi?'Tallenna tavoite':'Spara mål'}</button>{message?<p role="status">{message}</p>:null}</form>}


