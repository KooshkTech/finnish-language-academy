import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { materializeWeeklyAssignments } from "@/services/schedule-engine"
import type { AgeTier, LearningProfileState } from "@/types/profile"

function validTimezone(value: string | null) {
  const timeZone = value || "Europe/Helsinki"
  try { new Intl.DateTimeFormat("en",{timeZone}).format(); return timeZone } catch { return "Europe/Helsinki" }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ configured:false, assignments:[] })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:"Authentication required" }, { status:401 })
  const requestedTimezone = validTimezone(request.nextUrl.searchParams.get("tz"))
  const { data: profileRow } = await supabase.from("learning_profiles").select("age_tier,intensity,timezone").eq("user_id",user.id).maybeSingle()
  const ageTier = (profileRow?.age_tier ?? "adult") as AgeTier
  const intensity = (profileRow?.intensity ?? "casual") as LearningProfileState["intensity"]
  const timeZone = validTimezone(profileRow?.timezone ?? requestedTimezone)
  const generated = materializeWeeklyAssignments({ageTier,intensity},timeZone)
  const weekStart = generated[0]?.weekStart
  if (!weekStart) return NextResponse.json({ configured:true, assignments:[] })

  const { data: existing, error: existingError } = await supabase.from("weekly_assignments").select("*").eq("user_id", user.id).eq("week_start",weekStart).order("due_at")
  if (existingError) return NextResponse.json({ error:"Could not load schedule" }, { status:500 })
  if (existing?.length) return NextResponse.json({ configured:true, timeZone, ageTier, intensity, assignments:existing })

  const rows = generated.map(task=>({ user_id:user.id, week_start:task.weekStart, day_of_week:task.day, assigned_module:task.assignedModule, homework_task_id:task.homeworkTaskId, due_at:task.dueAt, required_score:task.requiredScore ?? null, is_mandatory:task.isMandatory !== false }))
  const { data, error } = await supabase.from("weekly_assignments").insert(rows).select("*").order("due_at")
  if (error) return NextResponse.json({ error:`Could not create schedule: ${error.message}` }, { status:500 })
  await supabase.from("learning_profiles").upsert({user_id:user.id,age_tier:ageTier,intensity,timezone:timeZone},{onConflict:"user_id"})
  await supabase.from("user_accountability").upsert({user_id:user.id},{onConflict:"user_id",ignoreDuplicates:true})
  return NextResponse.json({ configured:true, created:true, timeZone, ageTier, intensity, assignments:data ?? [] })
}

type CompletePayload = { assignmentId?: string; score?: number }
export async function POST(request: NextRequest) {
  const body = await request.json() as CompletePayload
  if (!body.assignmentId) return NextResponse.json({error:"assignmentId is required"},{status:400})
  const supabase = await createClient(); if(!supabase)return NextResponse.json({error:"Supabase not configured"},{status:503})
  const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Authentication required"},{status:401})
  const {data:assignment,error}=await supabase.from("weekly_assignments").select("id,due_at,required_score,is_completed").eq("id",body.assignmentId).eq("user_id",user.id).maybeSingle()
  if(error||!assignment)return NextResponse.json({error:"Assignment not found"},{status:404})
  if(assignment.is_completed)return NextResponse.json({ok:true,alreadyCompleted:true})
  if(new Date(assignment.due_at).getTime()<Date.now())return NextResponse.json({error:"Deadline passed. Complete the remediation task before advanced progression."},{status:409})
  if(typeof assignment.required_score==="number"&&(typeof body.score!=="number"||body.score<assignment.required_score))return NextResponse.json({error:`A score of at least ${assignment.required_score}% is required.`},{status:422})
  const {error:updateError}=await supabase.from("weekly_assignments").update({is_completed:true,completed_at:new Date().toISOString()}).eq("id",assignment.id).eq("user_id",user.id)
  if(updateError)return NextResponse.json({error:updateError.message},{status:500})
  const {data:state}=await supabase.from("user_accountability").select("xp_total,kulta_balance,current_streak").eq("user_id",user.id).maybeSingle()
  await supabase.from("user_accountability").upsert({user_id:user.id,xp_total:(state?.xp_total??0)+20,kulta_balance:(state?.kulta_balance??0)+5,current_streak:(state?.current_streak??0)+1,updated_at:new Date().toISOString()},{onConflict:"user_id"})
  return NextResponse.json({ok:true,reward:{xp:20,kulta:5}})
}

