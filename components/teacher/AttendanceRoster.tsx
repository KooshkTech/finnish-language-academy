'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Status = 'present'|'late'|'absent'|'excused'
type Student = { id:string; name:string; currentStatus:Status|null; note:string|null }

export default function AttendanceRoster({ classId, sessionId, language, students }: {classId:string;sessionId:string;language:'fi'|'sv';students:Student[]}) {
  const fi=language==='fi'; const router=useRouter(); const [busy,setBusy]=useState<string|null>(null); const [message,setMessage]=useState('')
  const labels:Record<Status,string>={present:fi?'Paikalla':'Närvarande',late:fi?'Myöhässä':'Sen',absent:fi?'Poissa':'Frånvarande',excused:fi?'Selvitetty poissaolo':'Giltig frånvaro'}
  async function mark(studentId:string,status:Status,note='') { setBusy(studentId);setMessage('');const r=await fetch(`/api/teacher/classes/${classId}/sessions/${sessionId}/attendance`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({studentId,status,note})});const p=await r.json() as {error?:string};if(!r.ok)setMessage(p.error??(fi?'Läsnäolon tallennus epäonnistui.':'Det gick inte att spara närvaro.'));else router.refresh();setBusy(null) }
  return <div>
    {students.length ? students.map(student=><article key={student.id} className="teacher-dashboard-card" style={{marginTop:10}}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center'}}><div><strong>{student.name}</strong><p>{student.currentStatus ? labels[student.currentStatus] : (fi?'Ei merkitty':'Inte markerad')}</p></div><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{(Object.keys(labels) as Status[]).map(status=><button key={status} type="button" disabled={busy===student.id} onClick={()=>mark(student.id,status)}>{labels[status]}</button>)}</div></div></article>) : <p>{fi?'Luokassa ei ole opiskelijoita.':'Klassen har inga studerande.'}</p>}
    {message?<p role="status">{message}</p>:null}
  </div>
}

