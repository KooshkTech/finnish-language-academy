"use client"
import { useEffect, useState } from "react"
import { weeklyTemplate } from "@/data/classroom"

type Assignment = { id:string; day_of_week:string; assigned_module:string; homework_task_id:string; due_at:string; required_score:number|null; is_completed:boolean; is_mandatory:boolean }
type SchedulePayload = { configured?:boolean; assignments?:Assignment[]; error?:string; ageTier?:string; intensity?:string; timeZone?:string }

export function ScheduleBoard(){
  const [payload,setPayload]=useState<SchedulePayload>({})
  const [loading,setLoading]=useState(true)
  useEffect(()=>{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone; fetch(`/api/schedule?tz=${encodeURIComponent(tz)}`).then(async response=>({ok:response.ok,data:await response.json() as SchedulePayload})).then(({data})=>setPayload(data)).catch(()=>setPayload({error:"Schedule service unavailable."})).finally(()=>setLoading(false))},[])
  if(loading)return <section className="module-panel"><p>Luodaan viikko-ohjelmaa…</p></section>
  const assignments=payload.assignments??[]
  if(payload.error||!assignments.length)return <><section className="schedule-grid">{weeklyTemplate.map(task=><article key={task.day}><span>{task.day}</span><h2>{task.title}</h2><p>{task.minutes} min {task.requiredScore?`· tavoite ${task.requiredScore}%`:"· vapaaehtoinen"}</p><a href={task.assignedModule}>Avaa tehtävä</a></article>)}</section><p className="module-notice">Guest preview. Kirjaudu sisään, jotta serveri luo oman aikavyöhykkeen, ikäprofiilin ja intensiteetin mukaisen viikko-ohjelman. {payload.error??""}</p></>
  return <><div className="schedule-meta"><span>{payload.ageTier}</span><span>{payload.intensity}</span><span>{payload.timeZone}</span></div><section className="schedule-grid">{assignments.map(task=><article key={task.id} className={task.is_completed?"done":""}><span>{task.day_of_week}</span><h2>{task.homework_task_id.split("-").slice(3).join(" ").replaceAll("-"," ")}</h2><p>Due {new Date(task.due_at).toLocaleString()} {task.required_score?`· gate ${task.required_score}%`:task.is_mandatory?"· proof required":"· optional"}</p><a href={task.assigned_module}>Avaa tehtävä</a></article>)}</section></>
}

