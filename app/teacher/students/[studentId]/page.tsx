import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'

type StudentProgressRow = {
  lesson_slug: string
  progress_percent: number
  completed_at: string | null
  updated_at: string | null
}

type ExerciseAttemptRow = {
  lesson_slug: string | null
  grammar_topic: string | null
  is_correct: boolean
  attempted_at: string | null
}

type ActivityRow = {
  activity_date: string
  minutes: number
  exercises: number
}

type SubmissionRow = {
  assignment_id: string
  status: string
  score: number | null
  submitted_at: string | null
}

const fiSkills: Record<string,string> = { listening:'Kuuntelu', reading:'Lukeminen', writing:'Kirjoittaminen', speaking:'Puhuminen', understanding:'Kielioppi', vocabulary:'Sanasto' }
const svSkills: Record<string,string> = { listening:'Lyssna', reading:'Läsa', writing:'Skriva', speaking:'Tala', understanding:'Grammatik', vocabulary:'Ordförråd' }

function skillFromSlug(slug: string | null) {
  if (!slug) return null
  const parts = slug.split(':')
  return parts.length >= 3 ? parts[2] : null
}

function pct(value: number) { return `${Math.round(value)}%` }

export const metadata = { title: 'Opiskelijan edistyminen | OpiOpe', robots: { index: false, follow: false } }

export default async function TeacherStudentPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  const access = await checkTeacherAccess(true)
  if (!access.ok) redirect(access.reason === 'mfa-required' ? '/teacher/security' : '/')
  const admin = createAdminClient(); if (!admin) redirect('/')
  const fi = access.courseLanguage === 'fi'
  const skills = fi ? fiSkills : svSkills

  const { data: relation } = await admin.from('teacher_class_members')
    .select('class_id,teacher_classes!inner(teacher_id,name,course_language)')
    .eq('student_id', studentId)
    .eq('teacher_classes.teacher_id', access.userId)
    .eq('teacher_classes.course_language', access.courseLanguage)
    .limit(1)
    .maybeSingle()
  if (!relation) notFound()

  // eslint-disable-next-line react-hooks/purity -- analytics window is evaluated at request time.
  const since14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [{ data: profile }, { data: progress }, { data: attempts }, { data: activity }, { data: assignments }] = await Promise.all([
    admin.from('profiles').select('display_name,username,current_level,course_language,learning_goal').eq('id', studentId).maybeSingle(),
    admin.from('lesson_progress').select('lesson_slug,progress_percent,completed_at,updated_at').eq('user_id', studentId).order('updated_at', { ascending: false }).limit(50),
    admin.from('exercise_attempts').select('lesson_slug,grammar_topic,is_correct,attempted_at').eq('user_id', studentId).order('attempted_at', { ascending: false }).limit(100),
    admin.from('daily_activity').select('activity_date,minutes,exercises').eq('user_id', studentId).gte('activity_date', since14).order('activity_date', { ascending: false }),
    admin.from('teacher_assignments').select('id').eq('class_id', relation.class_id).eq('teacher_id', access.userId),
  ])
  if (!profile || profile.course_language !== access.courseLanguage) notFound()

  const assignmentIds = assignments?.map((row) => row.id) ?? []
  const { data: submissions } = assignmentIds.length
    ? await admin.from('assignment_submissions').select('assignment_id,status,score,submitted_at').eq('student_id', studentId).in('assignment_id', assignmentIds)
    : { data: [] as SubmissionRow[] }

  const progressRows = (progress ?? []) as StudentProgressRow[]
  const attemptRows = (attempts ?? []) as ExerciseAttemptRow[]
  const activityRows = (activity ?? []) as ActivityRow[]
  const submissionRows = (submissions ?? []) as SubmissionRow[]
  const wrong = attemptRows.filter((row) => !row.is_correct)
  const completed = progressRows.filter((row) => Boolean(row.completed_at)).length
  const avgProgress = progressRows.length ? progressRows.reduce((sum,row)=>sum+row.progress_percent,0)/progressRows.length : 0
  const accuracy = attemptRows.length ? attemptRows.filter((row)=>row.is_correct).length / attemptRows.length * 100 : null
  const scores = submissionRows.filter((row)=>row.score !== null).map((row)=>row.score as number)
  const assignmentAverage = scores.length ? scores.reduce((sum,score)=>sum+score,0)/scores.length : null
  const minutes14 = activityRows.reduce((sum,row)=>sum+row.minutes,0)
  const exercises14 = activityRows.reduce((sum,row)=>sum+row.exercises,0)

  const skillStats = Object.keys(skills).map((skill) => {
    const rows = attemptRows.filter((row)=>skillFromSlug(row.lesson_slug)===skill)
    return { skill, attempts: rows.length, accuracy: rows.length ? rows.filter((row)=>row.is_correct).length / rows.length * 100 : null }
  }).filter((row)=>row.attempts>0).sort((a,b)=>(a.accuracy??100)-(b.accuracy??100))

  return <main className="teacher-dashboard-page">
    <header className="teacher-settings-header">
      <Link href={`/teacher/classes/${relation.class_id}`}>{fi ? '← Luokka' : '← Klass'}</Link>
      <div>
        <p className="eyebrow">{fi ? 'OPISKELIJAN SUORITUSKYKY' : 'STUDERANDENS PRESTATION'}</p>
        <h1>{profile.display_name ?? profile.username ?? (fi ? 'Opiskelija' : 'Studerande')}</h1>
        <p>{fi ? 'Taso' : 'Nivå'} {profile.current_level ?? 'A0'} · {fi ? 'Kurssi' : 'Kurs'} {profile.course_language === 'sv' ? (fi ? 'Ruotsi' : 'Svenska') : (fi ? 'Suomi' : 'Finska')} · {fi ? 'Tavoite' : 'Mål'} {profile.learning_goal ?? '—'}</p>
      </div>
    </header>

    <section className="teacher-dashboard-grid" style={{marginBottom:32}}>
      <div className="teacher-dashboard-card"><small>{fi?'EDISTYMINEN':'FRAMSTEG'}</small><h2>{pct(avgProgress)}</h2><p>{completed} {fi?'oppituntia valmiina':'lektioner klara'}</p></div>
      <div className="teacher-dashboard-card"><small>{fi?'HARJOITUSTARKKUUS':'ÖVNINGSNOGGRANNHET'}</small><h2>{accuracy===null?'—':pct(accuracy)}</h2><p>{attemptRows.length} {fi?'yritystä':'försök'}</p></div>
      <div className="teacher-dashboard-card"><small>{fi?'TEHTÄVIEN KESKIARVO':'UPPGIFTSMEDEL'}</small><h2>{assignmentAverage===null?'—':pct(assignmentAverage)}</h2><p>{scores.length} {fi?'arvioitua palautusta':'bedömda inlämningar'}</p></div>
      <div className="teacher-dashboard-card"><small>14 D</small><h2>{minutes14} min</h2><p>{exercises14} {fi?'harjoitusta':'övningar'}</p></div>
    </section>

    <section style={{marginBottom:28}}>
      <h2>{fi ? 'Taidot' : 'Färdigheter'}</h2>
      {skillStats.length ? <div className="teacher-dashboard-grid">{skillStats.map((row)=><div className="teacher-dashboard-card" key={row.skill}><h3>{skills[row.skill]}</h3><p>{fi?'Tarkkuus':'Noggrannhet'}: <strong>{row.accuracy===null?'—':pct(row.accuracy)}</strong></p><p>{row.attempts} {fi?'yritystä':'försök'}</p></div>)}</div> : <p>{fi?'Taitokohtaista harjoitusdataa ei ole vielä riittävästi.':'Det finns ännu inte tillräckligt med färdighetsspecifik övningsdata.'}</p>}
    </section>

    <section><h2>{fi ? 'Viimeisin edistyminen' : 'Senaste framsteg'}</h2>{progressRows.length ? progressRows.slice(0,12).map((p) => <div key={p.lesson_slug} style={{padding:'8px 0'}}><strong>{p.lesson_slug}</strong> · {p.progress_percent}% {p.completed_at ? `· ${fi?'Valmis':'Klar'}` : ''}</div>) : <p>{fi ? 'Ei vielä tallennettua edistymistä.' : 'Inga sparade framsteg ännu.'}</p>}</section>
    <section style={{marginTop:28}}><h2>{fi ? 'Toistuvat vaikeudet' : 'Återkommande svårigheter'}</h2>{wrong.length ? wrong.slice(0,8).map((a, i) =><div key={`${a.grammar_topic}-${i}`} style={{padding:'8px 0'}}>{a.grammar_topic ?? (fi ? 'Harjoitus' : 'Övning')} · {fi ? 'tarkistettava' : 'behöver granskas'}</div>) : <p>{fi ? 'Ei viimeaikaisia virheitä.' : 'Inga nyliga fel.'}</p>}</section>
  </main>
}

