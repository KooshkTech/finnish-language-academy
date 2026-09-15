import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest, { params }: { params: Promise<{ classId: string; sessionId: string }> }) {
  const { classId, sessionId } = await params
  const access = await checkTeacherAccess(true)
  if (!access.ok) return NextResponse.json({ error: 'Opettajan käyttöoikeus vaaditaan.' }, { status: access.reason === 'mfa-required' ? 403 : 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })
  const body = await request.json() as { status?: string }
  const status = String(body.status ?? '')
  if (!['scheduled', 'completed', 'cancelled'].includes(status)) return NextResponse.json({ error: 'Virheellinen tunnin tila.' }, { status: 400 })

  const { data: session, error: sessionError } = await admin.from('class_sessions').select('id,title,course_language,status').eq('id', sessionId).eq('class_id', classId).eq('teacher_id', access.userId).maybeSingle()
  if (sessionError) return NextResponse.json({ error: 'Tunnin tarkistus epäonnistui.' }, { status: 500 })
  if (!session || session.course_language !== access.courseLanguage) return NextResponse.json({ error: 'Tuntia ei löytynyt.' }, { status: 404 })
  const { error } = await admin.from('class_sessions').update({ status, updated_at: new Date().toISOString() }).eq('id', sessionId)
  if (error) return NextResponse.json({ error: 'Tunnin tilan päivitys epäonnistui.' }, { status: 500 })

  const warnings: string[] = []
  if (status === 'cancelled' && session.status !== 'cancelled') {
    const { data: members, error: membersError } = await admin.from('teacher_class_members').select('student_id').eq('class_id', classId)
    if (membersError) warnings.push('recipient-load-failed')
    if (members?.length) {
      const fi = access.courseLanguage === 'fi'
      const { error: notificationError } = await admin.from('user_notifications').upsert(members.map(member => ({ user_id: member.student_id, course_language: access.courseLanguage, notification_type: 'class_session_cancelled', title: fi ? 'Live-tunti peruttu' : 'Livelektionen inställd', body: session.title, link_path: `/student/classes/${classId}`, source_key: `class-session-cancelled:${sessionId}`, read_at: null, created_at: new Date().toISOString() })), { onConflict: 'user_id,source_key' })
      if (notificationError) warnings.push('notification-delivery-failed')
    }
  }
  const { error: auditError } = await admin.from('security_audit_log').insert({ actor_user_id: access.userId, event_type: 'class_session_status_changed', metadata: { classId, sessionId, status, warnings } })
  if (auditError) warnings.push('audit-log-failed')
  return NextResponse.json({ ok: true, warnings })
}

