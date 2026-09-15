import Link from 'next/link'
import SignOutButton from '@/components/auth/SignOutButton'
import { requireRole } from '@/lib/security/roles'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import AchievementPanel from '@/components/progress/AchievementPanel'
import StudentAppHub from '@/components/student/StudentAppHub'

type StudentMembership = {
  class_id: string
  joined_at: string | null
  teacher_classes: { name: string | null } | { name: string | null }[] | null
}

type LessonProgressRow = {
  lesson_slug: string
  progress_percent: number
  completed_at: string | null
  updated_at: string | null
}

function parseLessonSlug(slug: string) {
  const [language, level, skill] = slug.split(':')
  if ((language !== 'fi' && language !== 'sv') || !level || !skill) return null
  return { language, level, skill }
}

function lessonHref(slug: string) {
  const parsed = parseLessonSlug(slug)
  if (!parsed) return '/learn'
  return parsed.language === 'sv'
    ? `/course/sv/levels/${parsed.level}/${parsed.skill}`
    : `/levels/${parsed.level}/${parsed.skill}`
}

function lessonLabel(slug: string, fi: boolean) {
  const parsed = parseLessonSlug(slug)
  if (!parsed) return slug
  const labels: Record<string, { fi: string; sv: string }> = {
    listening: { fi: 'Kuuntelu', sv: 'Lyssna' },
    reading: { fi: 'Lukeminen', sv: 'Läsa' },
    writing: { fi: 'Kirjoittaminen', sv: 'Skriva' },
    speaking: { fi: 'Puhuminen', sv: 'Tala' },
    understanding: { fi: 'Kielioppi', sv: 'Grammatik' },
    vocabulary: { fi: 'Sanasto', sv: 'Ordförråd' },
  }
  const name = labels[parsed.skill]
  return `${parsed.level.toUpperCase()} · ${name ? (fi ? name.fi : name.sv) : parsed.skill}`
}

function classNameOf(value: StudentMembership['teacher_classes']) {
  if (Array.isArray(value)) return value[0]?.name ?? null
  return value?.name ?? null
}


function assignmentStatus(dueAt: string | null, submission: {status:string;score:number|null}|undefined, fi:boolean) {
  if (submission?.status === 'reviewed') return { label: submission.score == null ? (fi?'Arvioitu':'Bedömd') : `${fi?'Arvioitu':'Bedömd'} · ${submission.score}/100` }
  if (submission) return { label: fi?'Palautettu':'Inlämnad' }
  if (!dueAt) return { label: fi?'Avoin':'Öppen' }
  const diff = new Date(dueAt).getTime() - Date.now()
  if (diff < 0) return { label: fi?'Myöhässä':'Försenad' }
  if (diff <= 48*60*60*1000) return { label: fi?'Määräaika lähestyy':'Deadline närmar sig' }
  return { label: fi?'Avoin':'Öppen' }
}

export const metadata = { title: 'Opiskelijan työpöytä', robots: { index: false, follow: false } }

export default async function StudentDashboardPage() {
  const { admin, user, profile } = await requireRole(['student'])
  const courseLanguage = profile.course_language === 'sv' ? 'sv' : 'fi'
  const fi = courseLanguage === 'fi'
  const [{ data: progress }, { data: memberships }, { data: currentProgress }, { data: notifications }] = await Promise.all([
    admin.from('lesson_progress').select('lesson_slug,progress_percent,completed_at,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(12),
    admin.from('teacher_class_members').select('class_id,joined_at,teacher_classes(name)').eq('student_id', user.id).order('joined_at', { ascending: false }).limit(5),
    admin.from('user_progress').select('current_lesson,current_level').eq('user_id', user.id).maybeSingle(),
    admin.from('user_notifications').select('id,title,body,link_path,read_at,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(12),
  ])

  const classIds = (memberships as StudentMembership[] | null)?.map(m => m.class_id) ?? []
  const { data: assignments } = classIds.length
    ? await admin.from('teacher_assignments').select('id,title,cefr_level,due_at,class_id,status,created_at').in('class_id', classIds).eq('course_language', courseLanguage).eq('status','active').order('due_at',{ascending:true}).limit(20)
    : { data: [] as {id:string;title:string;cefr_level:string;due_at:string|null;class_id:string;status:string;created_at:string}[] }
  const assignmentIds = assignments?.map(a => a.id) ?? []
  const { data: submissions } = assignmentIds.length
    ? await admin.from('assignment_submissions').select('assignment_id,status,score,teacher_feedback,submitted_at').eq('student_id', user.id).in('assignment_id', assignmentIds)
    : { data: [] as {assignment_id:string;status:string;score:number|null;teacher_feedback:string|null;submitted_at:string|null}[] }
  const submissionByAssignment = new Map((submissions ?? []).map(s => [s.assignment_id, s]))
  const continueHref = currentProgress?.current_lesson ? lessonHref(currentProgress.current_lesson) : `/course/${courseLanguage}/levels`
  const continueLabel = currentProgress?.current_lesson ? lessonLabel(currentProgress.current_lesson, fi) : (fi ? 'Valitse taso A0–C2' : 'Välj nivå A0–C2')

  return <main className="teacher-dashboard-page">
    <header className="teacher-settings-header">
      <div style={{display:'flex',gap:12,alignItems:'center'}}><Link href="/">← OpiOpe</Link><SignOutButton language={courseLanguage} /></div>
      <div><p className="eyebrow">{fi ? 'OPISKELIJA' : 'STUDERANDE'}</p><h1>{fi ? 'Oma oppimispolkusi' : 'Din egen lärstig'}</h1><p>{fi ? `Taso ${profile.current_level ?? 'A0'} · ${profile.display_name ?? profile.username ?? ''}` : `Nivå ${profile.current_level ?? 'A0'} · ${profile.display_name ?? profile.username ?? ''}`}</p></div>
    </header>
    <StudentAppHub language={courseLanguage} classId={classIds[0] ?? null} unread={(notifications??[]).filter(n=>!n.read_at).length}/>
    <section className="teacher-dashboard-grid">
      <Link href={continueHref} className="teacher-dashboard-card"><small>01</small><h2>{fi ? 'Jatka oppimista' : 'Fortsätt lära'}</h2><p>{continueLabel}</p></Link>
      <Link href="/review" className="teacher-dashboard-card"><small>02</small><h2>{fi ? 'Kertaus' : 'Repetition'}</h2><p>{fi ? 'Kertaa sanastoa ja vaikeita kohtia.' : 'Repetera ordförråd och svåra moment.'}</p></Link>
      <Link href="/join-class" className="teacher-dashboard-card"><small>03</small><h2>{fi ? 'Liity luokkaan' : 'Gå med i en klass'}</h2><p>{fi ? 'Syötä opettajan antama liittymiskoodi.' : 'Ange koden som du fått av läraren.'}</p></Link>
      {fi ? <Link href="/yki" className="teacher-dashboard-card"><small>04</small><h2>YKI-harjoittelu</h2><p>Harjoittele YKI-tyyppisiä tehtäviä.</p></Link> : <Link href="/course/sv/levels" className="teacher-dashboard-card"><small>04</small><h2>Svenskakurs</h2><p>Fortsätt till nivåerna A0–C2.</p></Link>}
    </section>
    <section style={{marginTop:36}}>
      <div className="student-progress-heading"><div><p className="eyebrow">{fi ? 'ILMOITUKSET' : 'AVISERINGAR'}</p><h2>{fi ? 'Ajankohtaista' : 'Aktuellt'}</h2></div><strong>{(notifications??[]).filter(n=>!n.read_at).length} {fi?'uutta':'nya'}</strong></div>
      <NotificationCenter items={notifications ?? []} language={courseLanguage} />
    </section>
    <section style={{marginTop:36}}><h2>{fi ? 'Omat luokat' : 'Mina klasser'}</h2>{memberships?.length ? <div className="student-progress-list">{(memberships as StudentMembership[]).map((m) => <Link key={m.class_id} href={`/student/classes/${m.class_id}`} className="student-progress-row"><div><strong>{classNameOf(m.teacher_classes) ?? m.class_id}</strong><span>{fi ? 'Ilmoitukset ja viestit' : 'Meddelanden och kommunikation'}</span></div><b>→</b></Link>)}</div> : <p>{fi ? 'Et ole vielä liittynyt opettajan luokkaan.' : 'Du har ännu inte gått med i en lärarklass.'}</p>}</section>

    <section style={{marginTop:36}}>
      <div className="student-progress-heading"><div><p className="eyebrow">{fi ? 'OPETTAJAN TEHTÄVÄT' : 'LÄRARUPPGIFTER'}</p><h2>{fi ? 'Tehtävät ja määräajat' : 'Uppgifter och deadlines'}</h2></div></div>
      {assignments?.length ? <div className="student-progress-list">{assignments.map((a) => {const sub=submissionByAssignment.get(a.id); const state=assignmentStatus(a.due_at,sub,fi); return <Link key={a.id} href={`/student/assignments/${a.id}`} className="student-progress-row"><div><strong>{a.cefr_level} · {a.title}</strong><span><b>{state.label}</b>{a.due_at ? ` · ${fi ? 'DL' : 'Deadline'} ${new Date(a.due_at).toLocaleDateString(fi ? 'fi-FI' : 'sv-SE')}` : ''}</span></div><b>→</b></Link>})}</div> : <p>{fi ? 'Ei avoimia opettajan tehtäviä.' : 'Inga öppna läraruppgifter.'}</p>}
    </section>
    <section style={{marginTop:36}} className="student-progress-section">
      <div className="student-progress-heading"><div><p className="eyebrow">{fi ? 'EDISTYMINEN' : 'FRAMSTEG'}</p><h2>{fi ? 'Viimeisimmät oppitunnit' : 'Senaste lektionerna'}</h2></div>{progress?.length ? <strong>{(progress as LessonProgressRow[]).filter(p => Boolean(p.completed_at)).length} {fi ? 'valmiina' : 'klara'}</strong> : null}</div>
      {progress?.length ? <div className="student-progress-list">{(progress as LessonProgressRow[]).map((p) => <Link key={p.lesson_slug} href={lessonHref(p.lesson_slug)} className="student-progress-row"><div><strong>{lessonLabel(p.lesson_slug, fi)}</strong><span>{p.completed_at ? (fi ? 'Valmis' : 'Klar') : (fi ? 'Kesken' : 'Pågår')}</span></div><div className="student-progress-mini"><span style={{width:`${p.progress_percent}%`}} /></div><b>{p.progress_percent}%</b></Link>)}</div> : <p>{fi ? 'Aloita ensimmäinen oppitunti.' : 'Börja din första lektion.'}</p>}
    </section>
    <AchievementPanel />
  </main>
}

