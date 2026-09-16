import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import AttendanceRoster from '@/components/teacher/AttendanceRoster'
import SessionStatusControls from '@/components/teacher/SessionStatusControls'

type Profile={id:string;display_name:string|null;username:string|null}
type Attendance={student_id:string;attendance_status:'present'|'late'|'absent'|'excused';teacher_note:string|null}
export const metadata={title:'Läsnäolo | OpiOpe',robots:{index:false,follow:false}}
export default async function SessionPage({params}:{params:Promise<{classId:string;sessionId:string}>}){
 const {classId,sessionId}=await params;const access=await checkTeacherAccess(true);if(!access.ok)redirect(access.reason==='mfa-required'?'/teacher/security':'/');const admin=createAdminClient();if(!admin)redirect('/');const fi=access.courseLanguage==='fi'
 const {data:session}=await admin.from('class_sessions').select('id,title,description,starts_at,ends_at,meeting_url,location_text,status,course_language').eq('id',sessionId).eq('class_id',classId).eq('teacher_id',access.userId).maybeSingle();if(!session||session.course_language!==access.courseLanguage)notFound()
 const {data:teacherClass}=await admin.from('teacher_classes').select('id,name').eq('id',classId).eq('teacher_id',access.userId).maybeSingle();if(!teacherClass)notFound()
 const {data:members}=await admin.from('teacher_class_members').select('student_id').eq('class_id',classId);const ids=(members??[]).map(m=>m.student_id)
 const [{data:profiles},{data:attendance}]=await Promise.all([ids.length?admin.from('profiles').select('id,display_name,username').in('id',ids):Promise.resolve({data:[] as Profile[]}),admin.from('class_attendance').select('student_id,attendance_status,teacher_note').eq('session_id',sessionId)])
 const byStudent=new Map(((attendance??[]) as Attendance[]).map(a=>[a.student_id,a]));const students=((profiles??[]) as Profile[]).map(p=>({id:p.id,name:p.display_name??p.username??(fi?'Opiskelija':'Studerande'),currentStatus:byStudent.get(p.id)?.attendance_status??null,note:byStudent.get(p.id)?.teacher_note??null}))
 return <main className="teacher-dashboard-page"><header className="teacher-settings-header"><Link href={`/teacher/classes/${classId}`}>← {teacherClass.name}</Link><div><p className="eyebrow">{fi?'LIVE-TUNTI JA LÄSNÄOLO':'LIVELEKTION OCH NÄRVARO'}</p><h1>{session.title}</h1><p>{new Date(session.starts_at).toLocaleString(fi?'fi-FI':'sv-SE')} – {new Date(session.ends_at).toLocaleTimeString(fi?'fi-FI':'sv-SE',{hour:'2-digit',minute:'2-digit'})}</p>{session.description?<p>{session.description}</p>:null}{session.location_text?<p>{fi?'Paikka':'Plats'}: {session.location_text}</p>:null}{session.meeting_url?<p><a href={session.meeting_url} target="_blank" rel="noreferrer">{fi?'Avaa kokouslinkki':'Öppna möteslänk'} ↗</a></p>:null}</div></header><section style={{marginBottom:28}}><SessionStatusControls classId={classId} sessionId={sessionId} status={session.status} language={access.courseLanguage}/></section><section><p className="eyebrow">{fi?'LÄSNÄOLO':'NÄRVARO'}</p><h2>{fi?'Merkitse opiskelijat':'Markera studerande'}</h2><p>{fi?'Valitse jokaiselle opiskelijalle läsnäolotila. Merkinnät näkyvät opiskelijalle hänen omassa luokkanäkymässään.':'Välj närvarostatus för varje studerande. Markeringen visas för den studerande i den egna klassvyn.'}</p><AttendanceRoster classId={classId} sessionId={sessionId} language={access.courseLanguage} students={students}/></section></main>
}

