import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
function authorized(request:NextRequest){const expected=process.env.CRON_SECRET;return Boolean(expected&&request.headers.get('authorization')===`Bearer ${expected}`)}
export async function GET(request:NextRequest){
  if(!authorized(request)) return NextResponse.json({error:'Unauthorized'},{status:401})
  const admin=createAdminClient();if(!admin)return NextResponse.json({error:'Server not configured'},{status:503})
  const now=new Date();const soon=new Date(now.getTime()+48*60*60*1000)
  const {data:assignments,error}=await admin.from('teacher_assignments').select('id,class_id,title,due_at,course_language,status').eq('status','active').not('due_at','is',null).lte('due_at',soon.toISOString()).order('due_at',{ascending:true}).limit(500)
  if(error)return NextResponse.json({error:'Query failed'},{status:500})
  let notifications=0
  for(const assignment of assignments??[]){
    const {data:members}=await admin.from('teacher_class_members').select('student_id').eq('class_id',assignment.class_id)
    const {data:subs}=await admin.from('assignment_submissions').select('student_id').eq('assignment_id',assignment.id)
    const submitted=new Set((subs??[]).map(s=>s.student_id));const overdue=new Date(assignment.due_at as string).getTime()<now.getTime()
    const rows=(members??[]).filter(m=>!submitted.has(m.student_id)).map(m=>({user_id:m.student_id,course_language:assignment.course_language,notification_type:overdue?'assignment_overdue':'assignment_due_soon',title:overdue?(assignment.course_language==='sv'?'Uppgiften är försenad':'Tehtävä on myöhässä'):(assignment.course_language==='sv'?'Deadline närmar sig':'Määräaika lähestyy'),body:assignment.title,link_path:`/student/assignments/${assignment.id}`,source_key:`${overdue?'overdue':'due-soon'}:${assignment.id}`,read_at:null,created_at:now.toISOString()}))
    if(rows.length){const {error:upsertError}=await admin.from('user_notifications').upsert(rows,{onConflict:'user_id,source_key'});if(!upsertError)notifications+=rows.length}
  }
  return NextResponse.json({ok:true,notifications})
}

