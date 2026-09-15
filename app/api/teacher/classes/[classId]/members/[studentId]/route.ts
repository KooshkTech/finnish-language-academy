import { NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(_: Request, { params }: { params: Promise<{ classId: string; studentId: string }> }) {
  const { classId, studentId } = await params
  const access = await checkTeacherAccess(true)
  if (!access.ok) return NextResponse.json({ error: 'Opettajan käyttöoikeus vaaditaan.' }, { status: access.reason === 'mfa-required' ? 403 : 401 })
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })
  const { data: ownedClass } = await admin.from('teacher_classes').select('id').eq('id', classId).eq('teacher_id', access.userId).eq('course_language', access.courseLanguage).maybeSingle()
  if (!ownedClass) return NextResponse.json({ error: 'Luokkaa ei löytynyt.' }, { status: 404 })
  const { error } = await admin.from('teacher_class_members').delete().eq('class_id', classId).eq('student_id', studentId)
  if (error) return NextResponse.json({ error: 'Opiskelijan poistaminen epäonnistui.' }, { status: 500 })
  await admin.from('security_audit_log').insert({ actor_user_id: access.userId, event_type: 'teacher_removed_student_from_class', metadata: { classId, studentId } })
  return NextResponse.json({ ok: true })
}

