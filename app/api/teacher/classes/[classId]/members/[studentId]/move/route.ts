import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest, { params }: { params: Promise<{ classId: string; studentId: string }> }) {
  const { classId, studentId } = await params
  const access = await checkTeacherAccess(true)
  if (!access.ok) return NextResponse.json({ error: 'Opettajan käyttöoikeus vaaditaan.' }, { status: access.reason === 'mfa-required' ? 403 : 401 })
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })
  const body = await request.json() as { targetClassId?: string }
  const targetClassId = String(body.targetClassId ?? '')
  if (!targetClassId || targetClassId === classId) return NextResponse.json({ error: 'Valitse toinen luokka.' }, { status: 400 })
  const { data: ownedClasses } = await admin.from('teacher_classes').select('id').in('id', [classId, targetClassId]).eq('teacher_id', access.userId).eq('course_language', access.courseLanguage)
  if (!ownedClasses || ownedClasses.length !== 2) return NextResponse.json({ error: 'Luokan käyttöoikeus puuttuu.' }, { status: 403 })
  const { data: membership } = await admin.from('teacher_class_members').select('class_id').eq('class_id', classId).eq('student_id', studentId).maybeSingle()
  if (!membership) return NextResponse.json({ error: 'Opiskelija ei kuulu lähdeluokkaan.' }, { status: 404 })
  const { error: addError } = await admin.from('teacher_class_members').upsert({ class_id: targetClassId, student_id: studentId }, { onConflict: 'class_id,student_id' })
  if (addError) return NextResponse.json({ error: 'Opiskelijan siirtäminen epäonnistui.' }, { status: 500 })
  const { error: removeError } = await admin.from('teacher_class_members').delete().eq('class_id', classId).eq('student_id', studentId)
  if (removeError) return NextResponse.json({ error: 'Opiskelija lisättiin uuteen luokkaan, mutta vanhasta luokasta poistaminen epäonnistui.' }, { status: 500 })
  await admin.from('security_audit_log').insert({ actor_user_id: access.userId, event_type: 'teacher_moved_student_between_classes', metadata: { sourceClassId: classId, targetClassId, studentId } })
  return NextResponse.json({ ok: true })
}

