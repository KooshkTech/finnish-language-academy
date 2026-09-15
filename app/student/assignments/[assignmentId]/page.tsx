import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/security/roles'
import StudentSubmissionForm from '@/components/assignments/StudentSubmissionForm'

export const metadata = { title: 'Tehtävä | OpiOpe', robots: { index: false, follow: false } }

export default async function StudentAssignmentPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params
  const { admin, user, profile } = await requireRole(['student'])
  if (profile.account_mode === 'free') notFound()
  const language = profile.course_language === 'sv' ? 'sv' : 'fi'
  const fi = language === 'fi'
  const { data: assignment } = await admin.from('teacher_assignments').select('id,class_id,title,instructions,lesson_path,due_at,status,course_language,cefr_level,teacher_classes(name)').eq('id', assignmentId).maybeSingle()
  if (!assignment || assignment.status !== 'active' || assignment.course_language !== language) notFound()
  const { data: membership } = await admin.from('teacher_class_members').select('class_id').eq('class_id', assignment.class_id).eq('student_id', user.id).maybeSingle()
  if (!membership) notFound()
  const { data: submission } = await admin.from('assignment_submissions').select('id,answer_text,status,score,teacher_feedback,submitted_at,reviewed_at').eq('assignment_id', assignmentId).eq('student_id', user.id).maybeSingle()
  const classValue = assignment.teacher_classes as { name?: string | null } | { name?: string | null }[] | null
  const className = Array.isArray(classValue) ? classValue[0]?.name : classValue?.name
  // eslint-disable-next-line react-hooks/purity -- deadline status is evaluated at request time.
  const expired = assignment.due_at ? new Date(assignment.due_at).getTime() < Date.now() : false

  return <main className="teacher-dashboard-page">
    <header className="teacher-settings-header"><Link href="/student">{fi ? '← Opiskelijan työpöytä' : '← Studerandens arbetsyta'}</Link><div><p className="eyebrow">{fi ? 'OPETTAJAN TEHTÄVÄ' : 'LÄRARUPPGIFT'}</p><h1>{assignment.title}</h1><p>{assignment.cefr_level} · {className ?? (fi ? 'Luokka' : 'Klass')}{assignment.due_at ? ` · ${fi ? 'Määräaika' : 'Deadline'} ${new Date(assignment.due_at).toLocaleString(fi ? 'fi-FI' : 'sv-SE')}` : ''}</p></div></header>
    <section className="card"><h2>{fi ? 'Ohjeet' : 'Instruktioner'}</h2><p style={{whiteSpace:'pre-wrap'}}>{assignment.instructions || (fi ? 'Opettaja ei lisännyt erillisiä ohjeita.' : 'Läraren lade inte till separata instruktioner.')}</p>{assignment.lesson_path && <Link href={assignment.lesson_path} className="primary-button" style={{display:'inline-block',marginTop:12}}>{fi ? 'Avaa oppitunti' : 'Öppna lektion'} →</Link>}</section>
    <section style={{marginTop:28}}><h2>{fi ? 'Palautus' : 'Inlämning'}</h2>{submission?.status === 'reviewed' && <div className="card" style={{marginBottom:18}}><strong>{fi ? 'Opettajan palaute' : 'Lärarens återkoppling'}</strong><p>{submission.score == null ? (fi ? 'Ei pistemäärää' : 'Ingen poäng') : `${submission.score}/100`}</p><p style={{whiteSpace:'pre-wrap'}}>{submission.teacher_feedback || (fi ? 'Ei kirjallista palautetta.' : 'Ingen skriftlig återkoppling.')}</p></div>}{expired ? <p>{fi ? 'Määräaika on päättynyt. Et voi enää muuttaa palautusta.' : 'Deadline har passerat. Du kan inte längre ändra inlämningen.'}</p> : <StudentSubmissionForm assignmentId={assignment.id} language={language} initialAnswer={submission?.answer_text ?? ''} />}</section>
  </main>
}

