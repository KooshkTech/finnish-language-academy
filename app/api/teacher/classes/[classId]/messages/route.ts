import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'

export async function POST(request:NextRequest,{params}:{params:Promise<{classId:string}>}){
  const {classId}=await params;const access=await checkTeacherAccess(true)
  if(!access.ok)return NextResponse.json({error:'Opettajan käyttöoikeus vaaditaan.'},{status:access.reason==='mfa-required'?403:401})
  const allowed=await enforceRateLimit({request,scope:'teacher-class-message',identifier:access.userId,maxHits:200,windowSeconds:24*60*60});if(!allowed)return NextResponse.json({error:'Viestiraja täyttyi.'},{status:429})
  const admin=createAdminClient();if(!admin)return NextResponse.json({error:'Palvelin ei ole konfiguroitu.'},{status:503})
  const data=await request.json() as {studentId?:string;body?:string};const studentId=String(data.studentId??'');const body=String(data.body??'').trim().slice(0,4000);if(!studentId||!body)return NextResponse.json({error:'Viestin tiedot ovat puutteelliset.'},{status:400})
  const [{data:teacherClass},{data:member}]=await Promise.all([admin.from('teacher_classes').select('id,course_language').eq('id',classId).eq('teacher_id',access.userId).maybeSingle(),admin.from('teacher_class_members').select('student_id').eq('class_id',classId).eq('student_id',studentId).maybeSingle()])
  if(!teacherClass||teacherClass.course_language!==access.courseLanguage||!member)return NextResponse.json({error:'Opiskelijaa ei löytynyt tästä luokasta.'},{status:404})
  const {data:message,error}=await admin.from('class_messages').insert({class_id:classId,sender_user_id:access.userId,recipient_user_id:studentId,course_language:access.courseLanguage,body}).select('id').single();if(error||!message)return NextResponse.json({error:'Viestin lähetys epäonnistui.'},{status:500})
  const fi=access.courseLanguage==='fi';await admin.from('user_notifications').upsert({user_id:studentId,course_language:access.courseLanguage,notification_type:'class_message',title:fi?'Uusi viesti opettajalta':'Nytt meddelande från läraren',body:body.slice(0,180),link_path:`/student/classes/${classId}`,source_key:`class-message:${message.id}`,read_at:null,created_at:new Date().toISOString()},{onConflict:'user_id,source_key'})
  return NextResponse.json({ok:true})
}

