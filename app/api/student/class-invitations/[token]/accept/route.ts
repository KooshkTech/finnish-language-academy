import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/security/roles'
import { enforceRateLimit } from '@/lib/security/rate-limit'

export async function POST(request:NextRequest,{params}:{params:Promise<{token:string}>}){
  const {token}=await params;const {admin,user,profile}=await requireRole(['student'])
  const allowed=await enforceRateLimit({request,scope:'student-class-invite-accept',identifier:user.id,maxHits:30,windowSeconds:60*60})
  if(!allowed)return NextResponse.json({error:'Liian monta yritystä.'},{status:429})
  const {data:invite}=await admin.from('class_invitations').select('id,class_id,teacher_id,course_language,target_student_id,status,expires_at').eq('invite_token',token).maybeSingle()
  if(!invite||invite.status!=='pending')return NextResponse.json({error:'Kutsu ei ole enää voimassa.'},{status:404})
  if(new Date(invite.expires_at).getTime()<Date.now())return NextResponse.json({error:'Kutsu on vanhentunut.'},{status:410})
  if(invite.target_student_id&&invite.target_student_id!==user.id)return NextResponse.json({error:'Tämä kutsu on tarkoitettu toiselle opiskelijalle.'},{status:403})
  if(profile.course_language!==invite.course_language)return NextResponse.json({error:'Kurssikieli ei vastaa kutsua.'},{status:400})
  const {data:teacherClass}=await admin.from('teacher_classes').select('id,teacher_id,course_language').eq('id',invite.class_id).maybeSingle()
  if(!teacherClass||teacherClass.teacher_id!==invite.teacher_id||teacherClass.course_language!==invite.course_language)return NextResponse.json({error:'Luokkaa ei löytynyt.'},{status:404})
  const {error}=await admin.from('teacher_class_members').upsert({class_id:invite.class_id,student_id:user.id,joined_at:new Date().toISOString()},{onConflict:'class_id,student_id'})
  if(error)return NextResponse.json({error:'Luokkaan liittyminen epäonnistui.'},{status:500})
  await admin.from('class_invitations').update({status:'accepted',accepted_at:new Date().toISOString(),target_student_id:user.id}).eq('id',invite.id)
  await admin.from('security_audit_log').insert({actor_user_id:user.id,event_type:'class_invitation_accepted',metadata:{classId:invite.class_id,invitationId:invite.id}})
  return NextResponse.json({classId:invite.class_id})
}

