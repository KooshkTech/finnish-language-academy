import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'

type ProfileRow = {
  id: string
  display_name: string | null
  username: string | null
  current_level: string | null
  course_language: string | null
}

type ProgressRow = {
  user_id: string
  lesson_slug: string
  progress_percent: number
  completed_at: string | null
  updated_at: string | null
}

type AttemptRow = {
  user_id: string
  lesson_slug: string | null
  grammar_topic: string | null
  is_correct: boolean
  attempted_at: string | null
}

type ActivityRow = {
  user_id: string
  activity_date: string
  minutes: number
  exercises: number
}

type AssignmentRow = {
  id: string
  status: string
  due_at: string | null
}

type SubmissionRow = {
  assignment_id: string
  student_id: string
  status: string
  score: number | null
  submitted_at: string | null
}

const skillLabelsFi: Record<string, string> = {
  listening: 'Kuuntelu',
  reading: 'Lukeminen',
  writing: 'Kirjoittaminen',
  speaking: 'Puhuminen',
  understanding: 'Kielioppi',
  vocabulary: 'Sanasto',
}
const skillLabelsSv: Record<string, string> = {
  listening: 'Lyssna',
  reading: 'Läsa',
  writing: 'Skriva',
  speaking: 'Tala',
  understanding: 'Grammatik',
  vocabulary: 'Ordförråd',
}

function percent(value: number) {
  return `${Math.round(value)}%`
}

function skillFromSlug(slug: string | null) {
  if (!slug) return null
  const parts = slug.split(':')
  return parts.length >= 3 ? parts[2] : null
}

export const metadata = { title: 'Luokan analytiikka | OpiOpe', robots: { index: false, follow: false } }

export default async function TeacherClassAnalyticsPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params
  const access = await checkTeacherAccess(true)
  if (!access.ok) redirect(access.reason === 'mfa-required' ? '/teacher/security' : '/')
  const admin = createAdminClient()
  if (!admin) redirect('/')
  const fi = access.courseLanguage === 'fi'
  const skillLabels = fi ? skillLabelsFi : skillLabelsSv

  const { data: teacherClass } = await admin.from('teacher_classes')
    .select('id,name,course_language')
    .eq('id', classId)
    .eq('teacher_id', access.userId)
    .eq('course_language', access.courseLanguage)
    .maybeSingle()
  if (!teacherClass) notFound()

  const { data: members } = await admin.from('teacher_class_members')
    .select('student_id')
    .eq('class_id', classId)
  const studentIds = members?.map((member) => member.student_id) ?? []

  if (!studentIds.length) {
    return <main className="teacher-dashboard-page">
      <header className="teacher-settings-header">
        <Link href={`/teacher/classes/${classId}`}>{fi ? '← Luokka' : '← Klass'}</Link>
        <div><p className="eyebrow">{fi ? 'ANALYTIIKKA' : 'ANALYS'}</p><h1>{teacherClass.name}</h1></div>
      </header>
      <p>{fi ? 'Luokassa ei ole vielä opiskelijoita.' : 'Klassen har ännu inga studerande.'}</p>
    </main>
  }

  // eslint-disable-next-line react-hooks/purity -- analytics window is evaluated at request time.
  const since14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [{ data: profiles }, { data: progress }, { data: attempts }, { data: activity }, { data: assignments }] = await Promise.all([
    admin.from('profiles').select('id,display_name,username,current_level,course_language').in('id', studentIds),
    admin.from('lesson_progress').select('user_id,lesson_slug,progress_percent,completed_at,updated_at').in('user_id', studentIds).order('updated_at', { ascending: false }),
    admin.from('exercise_attempts').select('user_id,lesson_slug,grammar_topic,is_correct,attempted_at').in('user_id', studentIds).order('attempted_at', { ascending: false }).limit(1000),
    admin.from('daily_activity').select('user_id,activity_date,minutes,exercises').in('user_id', studentIds).gte('activity_date', since14),
    admin.from('teacher_assignments').select('id,status,due_at').eq('class_id', classId).eq('teacher_id', access.userId),
  ])

  const assignmentIds = (assignments as AssignmentRow[] | null)?.map((row) => row.id) ?? []
  const { data: submissions } = assignmentIds.length
    ? await admin.from('assignment_submissions').select('assignment_id,student_id,status,score,submitted_at').in('assignment_id', assignmentIds)
    : { data: [] as SubmissionRow[] }

  const progressRows = (progress ?? []) as ProgressRow[]
  const attemptRows = (attempts ?? []) as AttemptRow[]
  const activityRows = (activity ?? []) as ActivityRow[]
  const assignmentRows = (assignments ?? []) as AssignmentRow[]
  const submissionRows = (submissions ?? []) as SubmissionRow[]
  // eslint-disable-next-line react-hooks/purity -- analytics deadline state is evaluated at request time.
  const now = Date.now()
  const activeAssignments = assignmentRows.filter((assignment) => assignment.status === 'active')

  const students = (profiles ?? []).map((profile) => {
    const p = profile as ProfileRow
    const pRows = progressRows.filter((row) => row.user_id === p.id)
    const aRows = attemptRows.filter((row) => row.user_id === p.id)
    const dRows = activityRows.filter((row) => row.user_id === p.id)
    const sRows = submissionRows.filter((row) => row.student_id === p.id)
    const completed = pRows.filter((row) => Boolean(row.completed_at)).length
    const avgProgress = pRows.length ? pRows.reduce((sum, row) => sum + row.progress_percent, 0) / pRows.length : 0
    const accuracy = aRows.length ? (aRows.filter((row) => row.is_correct).length / aRows.length) * 100 : 0
    const reviewedScores = sRows.filter((row) => row.score !== null).map((row) => row.score as number)
    const assignmentAverage = reviewedScores.length ? reviewedScores.reduce((sum, score) => sum + score, 0) / reviewedScores.length : null
    const minutes14 = dRows.reduce((sum, row) => sum + row.minutes, 0)
    const exercises14 = dRows.reduce((sum, row) => sum + row.exercises, 0)
    const latestDates = [
      ...pRows.map((row) => row.updated_at),
      ...aRows.map((row) => row.attempted_at),
      ...sRows.map((row) => row.submitted_at),
    ].filter((value): value is string => Boolean(value))
    const lastActive = latestDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null
    const inactiveDays = lastActive ? Math.floor((now - new Date(lastActive).getTime()) / (24 * 60 * 60 * 1000)) : 999
    const missingAssignments = activeAssignments.filter((assignment) => !sRows.some((submission) => submission.assignment_id === assignment.id)).length
    const overdueMissing = activeAssignments.filter((assignment) => assignment.due_at && new Date(assignment.due_at).getTime() < now && !sRows.some((submission) => submission.assignment_id === assignment.id)).length

    const reasons: string[] = []
    if (inactiveDays >= 7) reasons.push(fi ? 'ei aktiivisuutta 7 päivään' : 'ingen aktivitet på 7 dagar')
    if (aRows.length >= 5 && accuracy < 60) reasons.push(fi ? 'harjoitustarkkuus alle 60 %' : 'övningsnoggrannhet under 60 %')
    if (overdueMissing > 0) reasons.push(fi ? `${overdueMissing} myöhässä olevaa tehtävää` : `${overdueMissing} försenade uppgifter`)
    if (pRows.length >= 3 && avgProgress < 40) reasons.push(fi ? 'oppituntien edistyminen on matala' : 'lektionsframstegen är låga')

    return {
      ...p,
      completed,
      avgProgress,
      accuracy,
      attempts: aRows.length,
      assignmentAverage,
      minutes14,
      exercises14,
      inactiveDays,
      lastActive,
      missingAssignments,
      overdueMissing,
      needsAttention: reasons.length > 0,
      reasons,
    }
  })

  const classProgress = students.length ? students.reduce((sum, student) => sum + student.avgProgress, 0) / students.length : 0
  const studentsWithAttempts = students.filter((student) => student.attempts > 0)
  const classAccuracy = studentsWithAttempts.length ? studentsWithAttempts.reduce((sum, student) => sum + student.accuracy, 0) / studentsWithAttempts.length : 0
  const scoredStudents = students.filter((student) => student.assignmentAverage !== null)
  const assignmentAverage = scoredStudents.length ? scoredStudents.reduce((sum, student) => sum + (student.assignmentAverage ?? 0), 0) / scoredStudents.length : null
  const attention = students.filter((student) => student.needsAttention)

  const skillStats = Object.keys(skillLabels).map((skill) => {
    const rows = attemptRows.filter((row) => skillFromSlug(row.lesson_slug) === skill)
    return {
      skill,
      attempts: rows.length,
      accuracy: rows.length ? (rows.filter((row) => row.is_correct).length / rows.length) * 100 : null,
    }
  }).filter((row) => row.attempts > 0)
  const weakSkills = [...skillStats].sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100)).slice(0, 3)

  return <main className="teacher-dashboard-page">
    <header className="teacher-settings-header">
      <Link href={`/teacher/classes/${classId}`}>{fi ? '← Luokka' : '← Klass'}</Link>
      <div>
        <p className="eyebrow">{fi ? 'LUOKAN ANALYTIIKKA' : 'KLASSANALYS'}</p>
        <h1>{teacherClass.name}</h1>
        <p>{fi ? 'Näe edistyminen, aktiivisuus, tehtävät ja opiskelijat, jotka tarvitsevat huomiota.' : 'Se framsteg, aktivitet, uppgifter och studerande som behöver uppmärksamhet.'}</p>
      </div>
    </header>

    <section className="teacher-dashboard-grid" style={{marginBottom:32}}>
      <div className="teacher-dashboard-card"><small>{fi ? 'OPISKELIJAT' : 'STUDERANDE'}</small><h2>{students.length}</h2><p>{fi ? `${attention.length} tarvitsee huomiota` : `${attention.length} behöver uppmärksamhet`}</p></div>
      <div className="teacher-dashboard-card"><small>{fi ? 'KESKIMÄÄRÄINEN EDISTYMINEN' : 'GENOMSNITTLIGT FRAMSTEG'}</small><h2>{percent(classProgress)}</h2><p>{fi ? 'Tallennettujen oppituntien perusteella' : 'Baserat på sparade lektioner'}</p></div>
      <div className="teacher-dashboard-card"><small>{fi ? 'HARJOITUSTARKKUUS' : 'ÖVNINGSNOGGRANNHET'}</small><h2>{studentsWithAttempts.length ? percent(classAccuracy) : '—'}</h2><p>{attemptRows.length} {fi ? 'harjoitusyritystä' : 'övningsförsök'}</p></div>
      <div className="teacher-dashboard-card"><small>{fi ? 'TEHTÄVIEN KESKIARVO' : 'UPPGIFTSMEDEL'}</small><h2>{assignmentAverage === null ? '—' : percent(assignmentAverage)}</h2><p>{fi ? `${submissionRows.filter((row) => row.score !== null).length} arvioitua palautusta` : `${submissionRows.filter((row) => row.score !== null).length} bedömda inlämningar`}</p></div>
    </section>

    <section style={{marginBottom:32}}>
      <div className="student-progress-heading"><div><p className="eyebrow">{fi ? 'HUOMIO' : 'UPPMÄRKSAMHET'}</p><h2>{fi ? 'Huomiota tarvitsevat opiskelijat' : 'Studerande som behöver uppmärksamhet'}</h2></div><strong>{attention.length}</strong></div>
      {attention.length ? attention.map((student) => <Link key={student.id} href={`/teacher/students/${student.id}`} className="teacher-dashboard-card" style={{display:'block',marginTop:12}}>
        <h3>{student.display_name ?? student.username ?? (fi ? 'Opiskelija' : 'Studerande')}</h3>
        <p>{student.reasons.join(' · ')}</p>
        <strong>{fi ? 'Avaa opiskelija' : 'Öppna studerande'} →</strong>
      </Link>) : <p>{fi ? 'Yksikään opiskelija ei täytä tämän hetken huomiokriteerejä.' : 'Ingen studerande uppfyller de aktuella uppmärksamhetskriterierna.'}</p>}
    </section>

    <section style={{marginBottom:32}}>
      <p className="eyebrow">{fi ? 'TAIDOT' : 'FÄRDIGHETER'}</p>
      <h2>{fi ? 'Heikoimmat taidot' : 'Svagaste färdigheter'}</h2>
      {weakSkills.length ? <div className="teacher-dashboard-grid">{weakSkills.map((row) => <div className="teacher-dashboard-card" key={row.skill}><h3>{skillLabels[row.skill]}</h3><p>{fi ? 'Tarkkuus' : 'Noggrannhet'}: <strong>{row.accuracy === null ? '—' : percent(row.accuracy)}</strong></p><p>{row.attempts} {fi ? 'yritystä' : 'försök'}</p></div>)}</div> : <p>{fi ? 'Harjoitusdataa ei ole vielä riittävästi.' : 'Det finns ännu inte tillräckligt med övningsdata.'}</p>}
    </section>

    <section>
      <p className="eyebrow">{fi ? 'OPISKELIJAT' : 'STUDERANDE'}</p>
      <h2>{fi ? 'Suorituskyky' : 'Prestation'}</h2>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:820}}>
          <thead><tr>
            <th style={{textAlign:'left',padding:'12px 8px'}}>{fi ? 'Opiskelija' : 'Studerande'}</th>
            <th style={{textAlign:'left',padding:'12px 8px'}}>{fi ? 'Taso' : 'Nivå'}</th>
            <th style={{textAlign:'left',padding:'12px 8px'}}>{fi ? 'Edistyminen' : 'Framsteg'}</th>
            <th style={{textAlign:'left',padding:'12px 8px'}}>{fi ? 'Tarkkuus' : 'Noggrannhet'}</th>
            <th style={{textAlign:'left',padding:'12px 8px'}}>{fi ? 'Tehtävät' : 'Uppgifter'}</th>
            <th style={{textAlign:'left',padding:'12px 8px'}}>14 d</th>
            <th style={{textAlign:'left',padding:'12px 8px'}}>{fi ? 'Tila' : 'Status'}</th>
          </tr></thead>
          <tbody>{students.map((student) => <tr key={student.id} style={{borderTop:'1px solid rgba(127,127,127,.22)'}}>
            <td style={{padding:'12px 8px'}}><Link href={`/teacher/students/${student.id}`}><strong>{student.display_name ?? student.username ?? (fi ? 'Opiskelija' : 'Studerande')}</strong></Link></td>
            <td style={{padding:'12px 8px'}}>{student.current_level ?? 'A0'}</td>
            <td style={{padding:'12px 8px'}}>{percent(student.avgProgress)} · {student.completed} {fi ? 'valmis' : 'klara'}</td>
            <td style={{padding:'12px 8px'}}>{student.attempts ? percent(student.accuracy) : '—'}</td>
            <td style={{padding:'12px 8px'}}>{student.assignmentAverage === null ? '—' : percent(student.assignmentAverage)} · {student.missingAssignments} {fi ? 'puuttuu' : 'saknas'}</td>
            <td style={{padding:'12px 8px'}}>{student.minutes14} min · {student.exercises14} {fi ? 'harj.' : 'övn.'}</td>
            <td style={{padding:'12px 8px'}}>{student.needsAttention ? (fi ? 'Tarkista' : 'Granska') : (fi ? 'Hyvä' : 'Bra')}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  </main>
}

