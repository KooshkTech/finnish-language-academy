import Link from 'next/link'
import { notFound,redirect } from 'next/navigation'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import ClassMessageComposer from '@/components/communication/ClassMessageComposer'

export const metadata={title:'Opiskelijaviestit | OpiOpe',robots:{index:false,follow:false}}
export default async function TeacherStudentMessagesPage({params}:{params:Promise<{classId:string;studentId:string}>}){
  const {classId,studentId}=await params;const access=await checkTeacherAccess(true);if(!access.ok)redirect(access.reason==='mfa-required'?'/teacher/security':'/');const admin=createAdminClient();if(!admin)redirect('/');const fi=access.courseLanguage==='fi'
  const [{data:teacherClass},{data:member},{data:student}]=await Promise.all([admin.from('teacher_classes').select('id,name,course_language').eq('id',classId).eq('teacher_id',access.userId).maybeSingle(),admin.from('teacher_class_members').select('student_id').eq('class_id',classId).eq('student_id',studentId).maybeSingle(),admin.from('profiles').select('display_name,username').eq('id',studentId).maybeSingle()]);if(!teacherClass||teacherClass.course_language!==access.courseLanguage||!member)notFound();const studentName=student?.display_name??student?.username??(fi?'Opiskelija':'Studerande')
  const {data:messages}=await admin.from('class_messages').select('id,sender_user_id,recipient_user_id,body,created_at').eq('class_id',classId).or(`and(sender_user_id.eq.${access.userId},recipient_user_id.eq.${studentId}),and(sender_user_id.eq.${studentId},recipient_user_id.eq.${access.userId})`).order('created_at',{ascending:true}).limit(100)
  return <main className="teacher-dashboard-page"><header className="teacher-settings-header"><Link href={`/teacher/classes/${classId}`}>← {teacherClass.name}</Link><div><p className="eyebrow">{fi?'OPISKELIJAVIESTIT':'STUDERANDEMEDDELANDEN'}</p><h1>{studentName}</h1><p>{fi?'Luokan sisäinen viestintä.':'Kommunikation inom klassen.'}</p></div></header><section><div className="student-progress-list" style={{marginBottom:16}}>{messages?.length?messages.map(m=><article key={m.id} className="teacher-dashboard-card"><strong>{m.sender_user_id===access.userId?(fi?'Sinä':'Du'):studentName}</strong><p>{m.body}</p><small>{new Date(m.created_at).toLocaleString(fi?'fi-FI':'sv-SE')}</small></article>):<p>{fi?'Ei viestejä vielä.':'Inga meddelanden ännu.'}</p>}</div><ClassMessageComposer endpoint={`/api/teacher/classes/${classId}/messages`} language={access.courseLanguage} extraBody={{studentId}}/></section></main>
}

