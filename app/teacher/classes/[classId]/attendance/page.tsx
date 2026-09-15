import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { attendanceSummary } from '@/lib/attendance/report.mjs'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'

type Profile = { id: string; display_name: string | null; username: string | null }
type Mark = { student_id: string; attendance_status: 'present' | 'late' | 'absent' | 'excused' }

export const metadata = { title: 'Läsnäoloraportti | OpiOpe', robots: { index: false, follow: false } }

export default async function AttendanceReport({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params
  const access = await checkTeacherAccess(true)
  if (!access.ok) redirect(access.reason === 'mfa-required' ? '/teacher/security' : '/')
  const admin = createAdminClient()
  if (!admin) redirect('/')
  const fi = access.courseLanguage === 'fi'
  const { data: teacherClass, error: classError } = await admin.from('teacher_classes').select('id,name,course_language').eq('id', classId).eq('teacher_id', access.userId).maybeSingle()
  if (classError || !teacherClass || teacherClass.course_language !== access.courseLanguage) notFound()

  const [{ data: sessions, error: sessionsError }, { data: members, error: membersError }] = await Promise.all([
    admin.from('class_sessions').select('id,title,starts_at,status').eq('class_id', classId).eq('teacher_id', access.userId).order('starts_at', { ascending: false }),
    admin.from('teacher_class_members').select('student_id').eq('class_id', classId),
  ])
  if (sessionsError || membersError) throw new Error('Attendance report source data could not be loaded')

  const ids = (members ?? []).map(member => member.student_id)
  const completedSessionIds = (sessions ?? []).filter(session => session.status === 'completed').map(session => session.id)
  const [{ data: profiles, error: profilesError }, { data: marks, error: marksError }] = await Promise.all([
    ids.length ? admin.from('profiles').select('id,display_name,username').in('id', ids) : Promise.resolve({ data: [] as Profile[], error: null }),
    completedSessionIds.length ? admin.from('class_attendance').select('student_id,attendance_status').in('session_id', completedSessionIds) : Promise.resolve({ data: [] as Mark[], error: null }),
  ])
  if (profilesError || marksError) throw new Error('Attendance report details could not be loaded')

  const rows = ((profiles ?? []) as Profile[]).map(profile => {
    const own = ((marks ?? []) as Mark[]).filter(mark => mark.student_id === profile.id)
    return { id: profile.id, name: profile.display_name ?? profile.username ?? (fi ? 'Opiskelija' : 'Studerande'), ...attendanceSummary(own, completedSessionIds.length) }
  })
  const statusTotal = (status: Mark['attendance_status']) => ((marks ?? []) as Mark[]).filter(mark => mark.attendance_status === status).length

  return <main className="teacher-dashboard-page">
    <header className="teacher-settings-header"><Link href={`/teacher/classes/${classId}`}>← {teacherClass.name}</Link><div><p className="eyebrow">{fi ? 'LÄSNÄOLORAPORTTI' : 'NÄRVARORAPPORT'}</p><h1>{fi ? 'Läsnäoloanalytiikka' : 'Närvaroanalys'}</h1><p>{completedSessionIds.length} {fi ? 'valmista tuntia' : 'slutförda lektioner'} · {rows.length} {fi ? 'opiskelijaa' : 'studerande'}</p></div></header>
    <section className="teacher-dashboard-grid"><article className="teacher-dashboard-card"><strong>{statusTotal('present')}</strong><h3>{fi ? 'Paikalla' : 'Närvarande'}</h3></article><article className="teacher-dashboard-card"><strong>{statusTotal('late')}</strong><h3>{fi ? 'Myöhässä' : 'Sena'}</h3></article><article className="teacher-dashboard-card"><strong>{statusTotal('absent')}</strong><h3>{fi ? 'Poissa' : 'Frånvarande'}</h3></article><article className="teacher-dashboard-card"><strong>{statusTotal('excused')}</strong><h3>{fi ? 'Selvitetty' : 'Giltig frånvaro'}</h3></article></section>
    <section style={{ marginTop: 28 }}><a className="primary-button" href={`/api/teacher/classes/${classId}/attendance.csv`}>{fi ? 'Lataa CSV-raportti' : 'Ladda ner CSV-rapport'} ↓</a><div style={{ overflowX: 'auto', marginTop: 18 }}><table><thead><tr><th>{fi ? 'Opiskelija' : 'Studerande'}</th><th>{fi ? 'Paikalla' : 'Närvarande'}</th><th>{fi ? 'Myöhässä' : 'Sen'}</th><th>{fi ? 'Poissa' : 'Frånvarande'}</th><th>{fi ? 'Selvitetty' : 'Giltig'}</th><th>{fi ? 'Merkitsemättä' : 'Omarkerad'}</th><th>{fi ? 'Läsnäoloaste' : 'Närvarograd'}</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td>{row.name}</td><td>{row.present}</td><td>{row.late}</td><td>{row.absent}</td><td>{row.excused}</td><td>{row.unmarked}</td><td>{row.rate === null ? '—' : `${row.rate}%`}</td></tr>)}</tbody></table></div>{!completedSessionIds.length ? <p>{fi ? 'Valmiita tunteja ei ole vielä.' : 'Det finns inga slutförda lektioner ännu.'}</p> : null}</section>
  </main>
}

