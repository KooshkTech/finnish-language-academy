import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  const supabase = await createClient(); const admin = createAdminClient()
  if (!supabase || !admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })
  const { data: authData } = await supabase.auth.getUser(); const user = authData.user
  if (!user) return NextResponse.json({ error: 'Kirjaudu sisään.' }, { status: 401 })
  const allowed = await enforceRateLimit({ request, scope: 'student-assignment-submit', identifier: user.id, maxHits: 100, windowSeconds: 24 * 60 * 60 })
  if (!allowed) return NextResponse.json({ error: 'Palautusraja täyttyi.' }, { status: 429 })
  const body = await request.json() as { assignmentId?: string; answerText?: string }
  const assignmentId = String(body.assignmentId ?? '')
  const answerText = String(body.answerText ?? '').trim().slice(0, 12000)
  if (!assignmentId || !answerText) return NextResponse.json({ error: 'Kirjoita vastaus ennen palautusta.' }, { status: 400 })

  const [{ data: profile }, { data: assignment }] = await Promise.all([
    admin.from('profiles').select('role,account_mode,course_language').eq('id', user.id).maybeSingle(),
    admin.from('teacher_assignments').select('id,class_id,teacher_id,title,course_language,due_at,status').eq('id', assignmentId).maybeSingle(),
  ])
  if (!profile || profile.role !== 'student' || profile.account_mode === 'free') return NextResponse.json({ error: 'Opiskelijatili vaaditaan.' }, { status: 403 })
  if (!assignment || assignment.status !== 'active' || assignment.course_language !== profile.course_language) return NextResponse.json({ error: 'Tehtävää ei löytynyt.' }, { status: 404 })
  const { data: membership } = await admin.from('teacher_class_members').select('class_id').eq('class_id', assignment.class_id).eq('student_id', user.id).maybeSingle()
  if (!membership) return NextResponse.json({ error: 'Et kuulu tämän tehtävän luokkaan.' }, { status: 403 })
  if (assignment.due_at && new Date(assignment.due_at).getTime() < Date.now()) return NextResponse.json({ error: profile.course_language === 'sv' ? 'Deadline har passerat.' : 'Määräaika on päättynyt.' }, { status: 409 })

  const now = new Date().toISOString()
  const { error } = await admin.from('assignment_submissions').upsert({ assignment_id: assignmentId, student_id: user.id, answer_text: answerText, status: 'submitted', score: null, teacher_feedback: null, submitted_at: now, reviewed_at: null, reviewed_by: null, updated_at: now }, { onConflict: 'assignment_id,student_id' })
  if (error) return NextResponse.json({ error: 'Tehtävän palautus epäonnistui.' }, { status: 500 })
  await admin.from('user_notifications').upsert({
    user_id: assignment.teacher_id,
    course_language: assignment.course_language,
    notification_type: 'submission_received',
    title: assignment.course_language === 'sv' ? 'Ny inlämning' : 'Uusi palautus',
    body: assignment.title,
    link_path: `/teacher/classes/${assignment.class_id}/assignments/${assignment.id}`,
    source_key: `submission:${assignment.id}:${user.id}`,
    read_at: null,
    created_at: now,
  }, { onConflict: 'user_id,source_key' })
  await admin.from('security_audit_log').insert({ actor_user_id: user.id, event_type: 'student_assignment_submitted', metadata: { assignmentId } })
  return NextResponse.json({ ok: true })
}

