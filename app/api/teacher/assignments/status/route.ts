import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'

const statuses=new Set(['active','closed','archived'])
export async function POST(request:NextRequest){
  const access=await checkTeacherAccess(true)
  if(!access.ok) return NextResponse.json({error:access.reason==='mfa-required'?'MFA vaaditaan.':'Opettajan käyttöoikeus vaaditaan.'},{status:access.reason==='mfa-required'?403:401})
  const allowed=await enforceRateLimit({request,scope:'teacher-assignment-status',identifier:access.userId,maxHits:300,windowSeconds:24*60*60})
  if(!allowed) return NextResponse.json({error:'Päivitysraja täyttyi.'},{status:429})
  const admin=createAdminClient(); if(!admin) return NextResponse.json({error:'Palvelin ei ole konfiguroitu.'},{status:503})
  const body=await request.json() as {assignmentId?:string;status?:string}; const assignmentId=String(body.assignmentId??''); const status=String(body.status??'')
  if(!assignmentId||!statuses.has(status)) return NextResponse.json({error:'Tila ei kelpaa.'},{status:400})
  const {data:assignment}=await admin.from('teacher_assignments').select('id,course_language').eq('id',assignmentId).eq('teacher_id',access.userId).maybeSingle()
  if(!assignment||assignment.course_language!==access.courseLanguage) return NextResponse.json({error:'Tehtävää ei löytynyt.'},{status:404})
  const {error}=await admin.from('teacher_assignments').update({status,updated_at:new Date().toISOString()}).eq('id',assignmentId).eq('teacher_id',access.userId)
  if(error) return NextResponse.json({error:'Tehtävän tilan päivitys epäonnistui.'},{status:500})
  await admin.from('security_audit_log').insert({actor_user_id:access.userId,event_type:'teacher_assignment_status_changed',metadata:{assignmentId,status}})
  return NextResponse.json({ok:true})
}

