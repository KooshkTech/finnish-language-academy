import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import TeacherFeedbackForm from '@/components/assignments/TeacherFeedbackForm'
import AssignmentStatusControls from '@/components/assignments/AssignmentStatusControls'

type SubmissionRow = { id:string; student_id:string; answer_text:string; status:string; score:number|null; teacher_feedback:string|null; submitted_at:string|null }
type StudentName = { id:string; display_name:string|null; username:string|null }

export const metadata = { title: 'Tehtävän palautukset | OpiOpe', robots: { index: false, follow: false } }

export default async function TeacherAssignmentPage({ params }: { params: Promise<{ classId:string; assignmentId:string }> }) {
  const { classId, assignmentId } = await params
  const access=await checkTeacherAccess(true); if(!access.ok) redirect(access.reason==='mfa-required'?'/teacher/security':'/')
  const admin=createAdminClient(); if(!admin) redirect('/')
  const fi=access.courseLanguage==='fi'
  const {data:assignment}=await admin.from('teacher_assignments').select('id,title,instructions,lesson_path,due_at,cefr_level,status,class_id,course_language,teacher_classes!inner(name,teacher_id)').eq('id',assignmentId).eq('class_id',classId).eq('teacher_id',access.userId).maybeSingle()
  if(!assignment||assignment.course_language!==access.courseLanguage) notFound()
  const {data:submissions}=await admin.from('assignment_submissions').select('id,student_id,answer_text,status,score,teacher_feedback,submitted_at').eq('assignment_id',assignmentId).order('submitted_at',{ascending:false})
  const rows=(submissions??[]) as SubmissionRow[]
  const {data:members}=await admin.from('teacher_class_members').select('student_id').eq('class_id',classId)
  const studentIds=[...new Set((members??[]).map(m=>m.student_id))]
  const {data:profiles}=studentIds.length?await admin.from('profiles').select('id,display_name,username').in('id',studentIds):{data:[] as StudentName[]}
  const names=new Map((profiles??[] as StudentName[]).map(profile=>[profile.id,profile]))
  const submittedIds=new Set(rows.map(row=>row.student_id))
  const missingStudents=(profiles??[] as StudentName[]).filter(profile=>!submittedIds.has(profile.id))
  const reviewed=rows.filter(row=>row.status==='reviewed').length
  const waitingReview=rows.length-reviewed
  // eslint-disable-next-line react-hooks/purity -- deadline status is evaluated at request time.
  const overdue=Boolean(assignment.due_at&&new Date(assignment.due_at).getTime()<Date.now())
  return <main className="teacher-dashboard-page">
    <header className="teacher-settings-header"><Link href={`/teacher/classes/${classId}`}>{fi?'← Luokka':'← Klass'}</Link><div><p className="eyebrow">{fi?'TEHTÄVÄ':'UPPGIFT'}</p><h1>{assignment.title}</h1><p>{assignment.cefr_level}{assignment.due_at?` · ${fi?'Määräaika':'Deadline'} ${new Date(assignment.due_at).toLocaleString(fi?'fi-FI':'sv-SE')}`:''}</p></div></header>
    <section className="card"><p style={{whiteSpace:'pre-wrap'}}>{assignment.instructions}</p>{assignment.lesson_path&&<Link href={assignment.lesson_path}>{fi?'Avaa oppitunti':'Öppna lektion'} →</Link>}</section>
    <AssignmentStatusControls assignmentId={assignment.id} status={assignment.status} language={access.courseLanguage} />
    <section className="teacher-dashboard-grid" style={{marginTop:18}}><div className="teacher-dashboard-card"><small>{fi?'PALAUTETTU':'INLÄMNAT'}</small><h2>{rows.length}/{studentIds.length}</h2></div><div className="teacher-dashboard-card"><small>{fi?'ODOTTAA ARVIOINTIA':'VÄNTAR PÅ BEDÖMNING'}</small><h2>{waitingReview}</h2></div><div className="teacher-dashboard-card"><small>{fi?'PUUTTUU':'SAKNAS'}</small><h2>{missingStudents.length}</h2></div><div className="teacher-dashboard-card"><small>{fi?'MÄÄRÄAIKA':'DEADLINE'}</small><h2>{overdue?(fi?'Päättynyt':'Passerad'):(fi?'Avoin':'Öppen')}</h2></div></section>
    <section style={{marginTop:30}}><h2>{fi?'Palautukset':'Inlämningar'} ({rows.length})</h2>{rows.length?rows.map(row=>{const profile=names.get(row.student_id);return <article key={row.id} className="card" style={{marginTop:16}}><h3>{profile?.display_name??profile?.username??(fi?'Opiskelija':'Studerande')}</h3><p><small>{row.submitted_at?new Date(row.submitted_at).toLocaleString(fi?'fi-FI':'sv-SE'):''}</small></p><p style={{whiteSpace:'pre-wrap'}}>{row.answer_text}</p><TeacherFeedbackForm submissionId={row.id} language={access.courseLanguage} initialScore={row.score} initialFeedback={row.teacher_feedback}/></article>}):<p>{fi?'Ei palautuksia vielä.':'Inga inlämningar ännu.'}</p>}</section>
    <section style={{marginTop:30}}><h2>{fi?'Puuttuvat palautukset':'Saknade inlämningar'} ({missingStudents.length})</h2>{missingStudents.length?<div className="student-progress-list">{missingStudents.map(student=><div className="student-progress-row" key={student.id}><div><strong>{student.display_name??student.username??(fi?'Opiskelija':'Studerande')}</strong><span>{overdue?(fi?'Myöhässä':'Försenad'):(fi?'Ei vielä palautettu':'Inte inlämnad ännu')}</span></div><b>—</b></div>)}</div>:<p>{fi?'Kaikki opiskelijat ovat palauttaneet tehtävän.':'Alla studerande har lämnat in uppgiften.'}</p>}</section>
  </main>
}

