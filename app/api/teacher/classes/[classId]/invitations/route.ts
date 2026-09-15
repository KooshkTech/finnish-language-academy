import { randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'

export async function POST(request:NextRequest,{params}:{params:Promise<{classId:string}>}){
  const {classId}=await params;const access=await checkTeacherAccess(true)
  if(!access.ok)return NextResponse.json({error:'Opettajan käyttöoikeus vaaditaan.'},{status:access.reason==='mfa-required'?403:401})
  const allowed=await enforceRateLimit({request,scope:'teacher-class-invite',identifier:access.userId,maxHits:80,windowSeconds:24*60*60})
  if(!allowed)return NextResponse.json({error:'Kutsuraja täyttyi.'},{status:429})
  const admin=createAdminClient();if(!admin)return NextResponse.json({error:'Palvelin ei ole konfiguroitu.'},{status:503})
  const {data:teacherClass}=await admin.from('teacher_classes').select('id,name,course_language').eq('id',classId).eq('teacher_id',access.userId).maybeSingle()
  if(!teacherClass||teacherClass.course_language!==access.courseLanguage)return NextResponse.json({error:'Luokkaa ei löytynyt.'},{status:404})
  const body=await request.json() as {username?:string};const username=String(body.username??'').trim().slice(0,80)
  let targetStudentId:string|null=null
  if(username){const {data:profile}=await admin.from('profiles').select('id,role,course_language').eq('username',username).maybeSingle();if(!profile||profile.role!=='student')return NextResponse.json({error:'Opiskelijaa ei löytynyt.'},{status:404});if(profile.course_language!==access.courseLanguage)return NextResponse.json({error:'Opiskelijan kurssikieli ei vastaa luokan kieltä.'},{status:400});targetStudentId=profile.id;const {data:member}=await admin.from('teacher_class_members').select('student_id').eq('class_id',classId).eq('student_id',profile.id).maybeSingle();if(member)return NextResponse.json({error:'Opiskelija kuuluu jo tähän luokkaan.'},{status:409})}
  const token=randomBytes(24).toString('base64url')
  const {data:invite,error}=await admin.from('class_invitations').insert({class_id:classId,teacher_id:access.userId,course_language:access.courseLanguage,invite_token:token,target_student_id:targetStudentId}).select('id,invite_token,expires_at').single()
  if(error||!invite)return NextResponse.json({error:'Kutsun luonti epäonnistui.'},{status:500})
  const invitePath=`/join-class/invite/${invite.invite_token}`
  if(targetStudentId){const fi=access.courseLanguage==='fi';await admin.from('user_notifications').upsert({user_id:targetStudentId,course_language:access.courseLanguage,notification_type:'class_invitation',title:fi?'Kutsu luokkaan':'Inbjudan till klass',body:teacherClass.name,link_path:invitePath,source_key:`class-invite:${invite.id}`,read_at:null,created_at:new Date().toISOString()},{onConflict:'user_id,source_key'})}
  await admin.from('security_audit_log').insert({actor_user_id:access.userId,event_type:'class_invitation_created',metadata:{classId,invitationId:invite.id,targetStudentId}})
  return NextResponse.json({invitePath,expiresAt:invite.expires_at})
}

