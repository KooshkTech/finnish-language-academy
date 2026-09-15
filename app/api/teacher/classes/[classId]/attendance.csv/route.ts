import { NextResponse } from 'next/server'
import { csvCell } from '@/lib/reports/csv.mjs'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'

type Session = { id: string; title: string; starts_at: string; status: string }
type Mark = { session_id: string; student_id: string; attendance_status: string; teacher_note: string | null }
type Profile = { id: string; display_name: string | null; username: string | null }

export async function GET(_: Request, { params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params
  const access = await checkTeacherAccess(true)
  if (!access.ok) return NextResponse.json({ error: 'Opettajan käyttöoikeus vaaditaan.' }, { status: access.reason === 'mfa-required' ? 403 : 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })

  const { data: teacherClass, error: classError } = await admin.from('teacher_classes').select('id,name,course_language').eq('id', classId).eq('teacher_id', access.userId).maybeSingle()
  if (classError) return NextResponse.json({ error: 'Luokan tarkistus epäonnistui.' }, { status: 500 })
  if (!teacherClass || teacherClass.course_language !== access.courseLanguage) return NextResponse.json({ error: 'Luokkaa ei löytynyt.' }, { status: 404 })

  const [{ data: sessions, error: sessionsError }, { data: members, error: membersError }] = await Promise.all([
    admin.from('class_sessions').select('id,title,starts_at,status').eq('class_id', classId).eq('teacher_id', access.userId).order('starts_at'),
    admin.from('teacher_class_members').select('student_id').eq('class_id', classId).order('joined_at'),
  ])
  if (sessionsError || membersError) return NextResponse.json({ error: 'Raportin tietojen lataus epäonnistui.' }, { status: 500 })

  const typedSessions = (sessions ?? []) as Session[]
  const studentIds = (members ?? []).map(member => member.student_id)
  const sessionIds = typedSessions.map(session => session.id)
  const [{ data: marks, error: marksError }, { data: profiles, error: profilesError }] = await Promise.all([
    sessionIds.length ? admin.from('class_attendance').select('session_id,student_id,attendance_status,teacher_note').in('session_id', sessionIds) : Promise.resolve({ data: [] as Mark[], error: null }),
    studentIds.length ? admin.from('profiles').select('id,display_name,username').in('id', studentIds) : Promise.resolve({ data: [] as Profile[], error: null }),
  ])
  if (marksError || profilesError) return NextResponse.json({ error: 'Raportin tietojen lataus epäonnistui.' }, { status: 500 })

  const markMap = new Map(((marks ?? []) as Mark[]).map(mark => [`${mark.session_id}:${mark.student_id}`, mark]))
  const profileMap = new Map(((profiles ?? []) as Profile[]).map(profile => [profile.id, profile]))
  const header = ['Class', 'Session', 'Start', 'Session status', 'Student', 'Attendance status', 'Teacher note']
  const lines = [header.map(csvCell).join(',')]
  for (const session of typedSessions) {
    for (const studentId of studentIds) {
      const mark = markMap.get(`${session.id}:${studentId}`)
      const profile = profileMap.get(studentId)
      const name = profile?.display_name ?? profile?.username ?? studentId
      lines.push([teacherClass.name, session.title, session.starts_at, session.status, name, mark?.attendance_status ?? 'unmarked', mark?.teacher_note ?? ''].map(csvCell).join(','))
    }
  }

  return new NextResponse(`\uFEFF${lines.join('\r\n')}`, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="opiope-attendance-${classId}.csv"`, 'cache-control': 'private, no-store' } })
}

