import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'
import { publishAutomaticFeedPost } from '@/lib/community/feed'

function safeUrl(value: string) {
  if (!value) return null
  try { const url = new URL(value); return url.protocol === 'https:' ? url.toString() : null } catch { return null }
}

export async function GET(_: NextRequest,{params}:{params:Promise<{classId:string}>}){
  const {classId}=await params; const access=await checkTeacherAccess(true)
  if(!access.ok)return NextResponse.json({error:'Opettajan käyttöoikeus vaaditaan.'},{status:access.reason==='mfa-required'?403:401})
  const admin=createAdminClient();if(!admin)return NextResponse.json({error:'Palvelin ei ole konfiguroitu.'},{status:503})
  const {data:owned}=await admin.from('teacher_classes').select('id').eq('id',classId).eq('teacher_id',access.userId).eq('course_language',access.courseLanguage).maybeSingle()
  if(!owned)return NextResponse.json({error:'Luokkaa ei löytynyt.'},{status:404})
  const {data,error}=await admin.from('class_sessions').select('id,title,description,starts_at,ends_at,meeting_url,location_text,status,created_at').eq('class_id',classId).order('starts_at',{ascending:true})
  if(error)return NextResponse.json({error:'Tuntien lataus epäonnistui.'},{status:500})
  return NextResponse.json({items:data??[]})
}

export async function POST(request:NextRequest,{params}:{params:Promise<{classId:string}>}){
  const {classId}=await params;const access=await checkTeacherAccess(true)
  if(!access.ok)return NextResponse.json({error:'Opettajan käyttöoikeus vaaditaan.'},{status:access.reason==='mfa-required'?403:401})
  const allowed=await enforceRateLimit({request,scope:'teacher-class-session-create',identifier:access.userId,maxHits:80,windowSeconds:24*60*60})
  if(!allowed)return NextResponse.json({error:'Tuntien luontiraja täyttyi.'},{status:429})
  const admin=createAdminClient();if(!admin)return NextResponse.json({error:'Palvelin ei ole konfiguroitu.'},{status:503})
  const {data:teacherClass}=await admin.from('teacher_classes').select('id,name,course_language').eq('id',classId).eq('teacher_id',access.userId).maybeSingle()
  if(!teacherClass||teacherClass.course_language!==access.courseLanguage)return NextResponse.json({error:'Luokkaa ei löytynyt.'},{status:404})
  const body=await request.json() as {title?:string;description?:string;startsAt?:string;endsAt?:string;meetingUrl?:string;locationText?:string}
  const title=String(body.title??'').trim().slice(0,180);const description=String(body.description??'').trim().slice(0,4000)||null
  const starts=new Date(String(body.startsAt??''));const ends=new Date(String(body.endsAt??''))
  if(title.length<2||Number.isNaN(starts.getTime())||Number.isNaN(ends.getTime())||ends<=starts)return NextResponse.json({error:'Tarkista tunnin otsikko ja ajat.'},{status:400})
  if(ends.getTime()-starts.getTime()>12*60*60*1000)return NextResponse.json({error:'Tunnin enimmäiskesto on 12 tuntia.'},{status:400})
  const rawUrl=String(body.meetingUrl??'').trim();const meetingUrl=safeUrl(rawUrl)
  if(rawUrl&&!meetingUrl)return NextResponse.json({error:'Kokouslinkin on oltava turvallinen https-osoite.'},{status:400})
  const locationText=String(body.locationText??'').trim().slice(0,240)||null
  const {data:session,error}=await admin.from('class_sessions').insert({class_id:classId,teacher_id:access.userId,course_language:access.courseLanguage,title,description,starts_at:starts.toISOString(),ends_at:ends.toISOString(),meeting_url:meetingUrl,location_text:locationText}).select('id,title,starts_at,ends_at').single()
  if(error||!session)return NextResponse.json({error:'Tunnin ajastus epäonnistui.'},{status:500})
  const warnings:string[]=[]
  const {error:feedError}=await publishAutomaticFeedPost(admin,{classId,authorUserId:access.userId,courseLanguage:access.courseLanguage,postType:'session',title:access.courseLanguage==='fi'?'Uusi live-tunti':'Ny livelektion',body:title,linkPath:`/student/classes/${classId}`})
  if(feedError)warnings.push('feed-publication-failed')
  const {data:members,error:membersError}=await admin.from('teacher_class_members').select('student_id').eq('class_id',classId)
  if(membersError)warnings.push('recipient-load-failed')
  if(members?.length){const fi=access.courseLanguage==='fi';const {error:notificationError}=await admin.from('user_notifications').upsert(members.map(m=>({user_id:m.student_id,course_language:access.courseLanguage,notification_type:'class_session_scheduled',title:fi?'Uusi live-tunti':'Ny livelektion',body:`${teacherClass.name}: ${title}`,link_path:`/student/classes/${classId}`,source_key:`class-session:${session.id}`,read_at:null,created_at:new Date().toISOString()})),{onConflict:'user_id,source_key'});if(notificationError)warnings.push('notification-delivery-failed')}
  const {error:auditError}=await admin.from('security_audit_log').insert({actor_user_id:access.userId,event_type:'class_session_created',metadata:{classId,sessionId:session.id,warnings}})
  if(auditError)warnings.push('audit-log-failed')
  return NextResponse.json({item:session,warnings})
}

