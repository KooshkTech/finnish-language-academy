import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security/roles'
import { enforceRateLimit } from '@/lib/security/rate-limit'

export async function POST(request:NextRequest,{params}:{params:Promise<{classId:string}>}){
  const {classId}=await params;const {admin,user,profile}=await requireRole(['student'])
  const allowed=await enforceRateLimit({request,scope:'student-class-message',identifier:user.id,maxHits:120,windowSeconds:24*60*60});if(!allowed)return NextResponse.json({error:'Viestiraja täyttyi.'},{status:429})
  const data=await request.json() as {body?:string};const body=String(data.body??'').trim().slice(0,4000);if(!body)return NextResponse.json({error:'Kirjoita viesti.'},{status:400})
  const [{data:member},{data:teacherClass}]=await Promise.all([admin.from('teacher_class_members').select('student_id').eq('class_id',classId).eq('student_id',user.id).maybeSingle(),admin.from('teacher_classes').select('id,teacher_id,course_language').eq('id',classId).maybeSingle()])
  if(!member||!teacherClass||teacherClass.course_language!==profile.course_language)return NextResponse.json({error:'Luokkaa ei löytynyt.'},{status:404})
  const {data:message,error}=await admin.from('class_messages').insert({class_id:classId,sender_user_id:user.id,recipient_user_id:teacherClass.teacher_id,course_language:teacherClass.course_language,body}).select('id').single();if(error||!message)return NextResponse.json({error:'Viestin lähetys epäonnistui.'},{status:500})
  const fi=teacherClass.course_language==='fi';await admin.from('user_notifications').upsert({user_id:teacherClass.teacher_id,course_language:teacherClass.course_language,notification_type:'class_message',title:fi?'Uusi viesti opiskelijalta':'Nytt meddelande från en studerande',body:body.slice(0,180),link_path:`/teacher/classes/${classId}/messages/${user.id}`,source_key:`class-message:${message.id}`,read_at:null,created_at:new Date().toISOString()},{onConflict:'user_id,source_key'})
  return NextResponse.json({ok:true})
}

