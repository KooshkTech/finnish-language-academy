import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'
import { publishAutomaticFeedPost } from '@/lib/community/feed'

const levels = new Set(['A0','A1','A2','B1','B2','C1','C2'])

export async function POST(request: NextRequest) {
  const access = await checkTeacherAccess(true)
  if (!access.ok) return NextResponse.json({ error: access.reason === 'mfa-required' ? 'MFA vaaditaan.' : 'Opettajan käyttöoikeus vaaditaan.' }, { status: access.reason === 'mfa-required' ? 403 : 401 })
  const allowed = await enforceRateLimit({ request, scope: 'teacher-assignment-create', identifier: access.userId, maxHits: 100, windowSeconds: 24 * 60 * 60 })
  if (!allowed) return NextResponse.json({ error: 'Tehtävien luontiraja täyttyi.' }, { status: 429 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })

  const body = await request.json() as { classId?: string; title?: string; instructions?: string; lessonPath?: string; cefrLevel?: string; dueAt?: string }
  const classId = String(body.classId ?? '')
  const title = String(body.title ?? '').trim().slice(0, 160)
  const instructions = String(body.instructions ?? '').trim().slice(0, 8000)
  const cefrLevel = String(body.cefrLevel ?? 'A0').toUpperCase()
  const rawPath = String(body.lessonPath ?? '').trim()
  const lessonPath = rawPath || null
  if (!classId || title.length < 2 || !levels.has(cefrLevel)) return NextResponse.json({ error: 'Tehtävän tiedot ovat puutteelliset.' }, { status: 400 })
  if (lessonPath && (!lessonPath.startsWith('/') || lessonPath.startsWith('//') || lessonPath.includes('://') || lessonPath.length > 300)) return NextResponse.json({ error: 'Oppitunnin polku ei kelpaa.' }, { status: 400 })

  let dueAt: string | null = null
  if (body.dueAt) {
    const parsed = new Date(body.dueAt)
    if (Number.isNaN(parsed.getTime())) return NextResponse.json({ error: 'Määräaika ei kelpaa.' }, { status: 400 })
    if (parsed.getTime() > Date.now() + 366 * 24 * 60 * 60 * 1000) return NextResponse.json({ error: 'Määräaika on liian kaukana tulevaisuudessa.' }, { status: 400 })
    dueAt = parsed.toISOString()
  }

  const { data: teacherClass } = await admin.from('teacher_classes').select('id,course_language').eq('id', classId).eq('teacher_id', access.userId).maybeSingle()
  if (!teacherClass || teacherClass.course_language !== access.courseLanguage) return NextResponse.json({ error: 'Luokkaa ei löytynyt.' }, { status: 404 })

  const { data, error } = await admin.from('teacher_assignments').insert({
    teacher_id: access.userId,
    class_id: classId,
    course_language: access.courseLanguage,
    cefr_level: cefrLevel,
    title,
    instructions,
    lesson_path: lessonPath,
    due_at: dueAt,
  }).select('id,title,due_at,status').single()
  if (error || !data) return NextResponse.json({ error: 'Tehtävän luonti epäonnistui.' }, { status: 500 })
  const warnings: string[] = []
  const { error: feedError } = await publishAutomaticFeedPost(admin,{classId,authorUserId:access.userId,courseLanguage:access.courseLanguage,postType:'lesson',title:access.courseLanguage==='fi'?'Uusi tehtävä':'Ny uppgift',body:title,linkPath:`/student/assignments/${data.id}`})
  if (feedError) warnings.push('feed-publication-failed')
  const { data: members, error: membersError } = await admin.from('teacher_class_members').select('student_id').eq('class_id', classId)
  if (membersError) warnings.push('recipient-load-failed')
  if (members?.length) {
    const fi = access.courseLanguage === 'fi'
    const { error: notificationError } = await admin.from('user_notifications').upsert(members.map(member => ({
      user_id: member.student_id,
      course_language: access.courseLanguage,
      notification_type: 'assignment_created',
      title: fi ? 'Uusi opettajan tehtävä' : 'Ny läraruppgift',
      body: title,
      link_path: `/student/assignments/${data.id}`,
      source_key: `assignment-created:${data.id}`,
      read_at: null,
      created_at: new Date().toISOString(),
    })), { onConflict: 'user_id,source_key' })
    if (notificationError) warnings.push('notification-delivery-failed')
  }
  const { error: auditError } = await admin.from('security_audit_log').insert({ actor_user_id: access.userId, event_type: 'teacher_assignment_created', metadata: { assignmentId: data.id, classId, warnings } })
  if (auditError) warnings.push('audit-log-failed')
  return NextResponse.json({ item: data, warnings })
}

