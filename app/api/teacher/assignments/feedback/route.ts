import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  const access = await checkTeacherAccess(true)
  if (!access.ok) return NextResponse.json({ error: access.reason === 'mfa-required' ? 'MFA vaaditaan.' : 'Opettajan käyttöoikeus vaaditaan.' }, { status: access.reason === 'mfa-required' ? 403 : 401 })
  const allowed = await enforceRateLimit({ request, scope: 'teacher-assignment-feedback', identifier: access.userId, maxHits: 300, windowSeconds: 24 * 60 * 60 })
  if (!allowed) return NextResponse.json({ error: 'Palauteraja täyttyi.' }, { status: 429 })
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })
  const body = await request.json() as { submissionId?: string; score?: number | null; feedback?: string }
  const submissionId = String(body.submissionId ?? '')
  const feedback = String(body.feedback ?? '').trim().slice(0, 8000)
  const score = body.score == null ? null : Number(body.score)
  if (!submissionId || (score !== null && (!Number.isInteger(score) || score < 0 || score > 100))) return NextResponse.json({ error: 'Palaute ei kelpaa.' }, { status: 400 })

  const { data: submission } = await admin.from('assignment_submissions').select('id,assignment_id,student_id,teacher_assignments!inner(id,class_id,title,teacher_id,course_language)').eq('id', submissionId).eq('teacher_assignments.teacher_id', access.userId).eq('teacher_assignments.course_language', access.courseLanguage).maybeSingle()
  if (!submission) return NextResponse.json({ error: 'Palautusta ei löytynyt.' }, { status: 404 })
  const now = new Date().toISOString()
  const { error } = await admin.from('assignment_submissions').update({ score, teacher_feedback: feedback || null, status: 'reviewed', reviewed_at: now, reviewed_by: access.userId, updated_at: now }).eq('id', submissionId)
  if (error) return NextResponse.json({ error: 'Palautteen tallennus epäonnistui.' }, { status: 500 })
  const assignmentRel = submission.teacher_assignments as unknown as { id:string; class_id:string; title:string; teacher_id:string; course_language:'fi'|'sv' } | { id:string; class_id:string; title:string; teacher_id:string; course_language:'fi'|'sv' }[]
  const assignment = Array.isArray(assignmentRel) ? assignmentRel[0] : assignmentRel
  if (assignment) await admin.from('user_notifications').upsert({
    user_id: submission.student_id,
    course_language: assignment.course_language,
    notification_type: 'feedback_received',
    title: assignment.course_language === 'sv' ? 'Läraren gav återkoppling' : 'Opettaja antoi palautetta',
    body: assignment.title,
    link_path: `/student/assignments/${submission.assignment_id}`,
    source_key: `feedback:${submissionId}`,
    read_at: null,
    created_at: now,
  }, { onConflict: 'user_id,source_key' })
  await admin.from('security_audit_log').insert({ actor_user_id: access.userId, event_type: 'teacher_assignment_reviewed', metadata: { submissionId, assignmentId: submission.assignment_id, studentId: submission.student_id } })
  return NextResponse.json({ ok: true })
}

