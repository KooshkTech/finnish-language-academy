import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest,{params}:{params:Promise<{classId:string}>}){
  const {classId}=await params
  const access=await checkTeacherAccess(true)
  if(!access.ok)return NextResponse.json({error:'Opettajan käyttöoikeus vaaditaan.'},{status:access.reason==='mfa-required'?403:401})
  const allowed=await enforceRateLimit({request,scope:'teacher-class-announcement',identifier:access.userId,maxHits:60,windowSeconds:24*60*60})
  if(!allowed)return NextResponse.json({error:'Ilmoitusraja täyttyi.'},{status:429})
  const admin=createAdminClient();if(!admin)return NextResponse.json({error:'Palvelin ei ole konfiguroitu.'},{status:503})
  const body=await request.json() as {title?:string;body?:string}
  const title=String(body.title??'').trim().slice(0,180);const text=String(body.body??'').trim().slice(0,4000)
  if(title.length<2||!text)return NextResponse.json({error:'Ilmoituksen tiedot ovat puutteelliset.'},{status:400})
  const {data:teacherClass}=await admin.from('teacher_classes').select('id,course_language').eq('id',classId).eq('teacher_id',access.userId).maybeSingle()
  if(!teacherClass||teacherClass.course_language!==access.courseLanguage)return NextResponse.json({error:'Luokkaa ei löytynyt.'},{status:404})
  const {data:announcement,error}=await admin.from('class_announcements').insert({class_id:classId,teacher_id:access.userId,course_language:access.courseLanguage,title,body:text}).select('id,title,body,created_at').single()
  if(error||!announcement)return NextResponse.json({error:'Ilmoituksen julkaisu epäonnistui.'},{status:500})
  const {data:members}=await admin.from('teacher_class_members').select('student_id').eq('class_id',classId)
  if(members?.length){const fi=access.courseLanguage==='fi';await admin.from('user_notifications').upsert(members.map(m=>({user_id:m.student_id,course_language:access.courseLanguage,notification_type:'class_announcement',title:fi?'Uusi luokkailmoitus':'Nytt klassmeddelande',body:title,link_path:`/student/classes/${classId}`,source_key:`class-announcement:${announcement.id}`,read_at:null,created_at:new Date().toISOString()})),{onConflict:'user_id,source_key'})}
  await admin.from('security_audit_log').insert({actor_user_id:access.userId,event_type:'class_announcement_created',metadata:{classId,announcementId:announcement.id}})
  return NextResponse.json({item:announcement})
}

