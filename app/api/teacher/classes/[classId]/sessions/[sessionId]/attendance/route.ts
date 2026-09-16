import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'

const valid=new Set(['present','late','absent','excused'])
export async function POST(request:NextRequest,{params}:{params:Promise<{classId:string;sessionId:string}>}){
  const {classId,sessionId}=await params;const access=await checkTeacherAccess(true)
  if(!access.ok)return NextResponse.json({error:'Opettajan käyttöoikeus vaaditaan.'},{status:access.reason==='mfa-required'?403:401})
  const allowed=await enforceRateLimit({request,scope:'teacher-attendance',identifier:access.userId,maxHits:500,windowSeconds:24*60*60});if(!allowed)return NextResponse.json({error:'Läsnäolomerkintöjen raja täyttyi.'},{status:429})
  const admin=createAdminClient();if(!admin)return NextResponse.json({error:'Palvelin ei ole konfiguroitu.'},{status:503})
  const body=await request.json() as {studentId?:string;status?:string;note?:string};const studentId=String(body.studentId??'');const status=String(body.status??'');const note=String(body.note??'').trim().slice(0,1000)||null
  if(!studentId||!valid.has(status))return NextResponse.json({error:'Virheellinen läsnäolomerkintä.'},{status:400})
  const [{data:session},{data:member}]=await Promise.all([admin.from('class_sessions').select('id,class_id,teacher_id,course_language').eq('id',sessionId).eq('class_id',classId).eq('teacher_id',access.userId).maybeSingle(),admin.from('teacher_class_members').select('student_id').eq('class_id',classId).eq('student_id',studentId).maybeSingle()])
  if(!session||session.course_language!==access.courseLanguage||!member)return NextResponse.json({error:'Tuntia tai opiskelijaa ei löytynyt.'},{status:404})
  const {error}=await admin.from('class_attendance').upsert({session_id:sessionId,class_id:classId,student_id:studentId,attendance_status:status,teacher_note:note,marked_by:access.userId,marked_at:new Date().toISOString()},{onConflict:'session_id,student_id'})
  if(error)return NextResponse.json({error:'Läsnäolon tallennus epäonnistui.'},{status:500})
  const {error:auditError}=await admin.from('security_audit_log').insert({actor_user_id:access.userId,event_type:'class_attendance_marked',metadata:{classId,sessionId,studentId,status}})
  return NextResponse.json({ok:true,warnings:auditError?['audit-log-failed']:[]})
}

