import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const admin = createAdminClient()
  if (!supabase || !admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user
  if (!user) return NextResponse.json({ error: 'Kirjaudu opiskelijana ennen luokkaan liittymistä.' }, { status: 401 })
  const { data: profile } = await admin.from('profiles').select('role,course_language,account_mode').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'student' || profile.account_mode === 'free') return NextResponse.json({ error: 'Vain opiskelijat voivat liittyä luokkaan.' }, { status: 403 })
  const allowed = await enforceRateLimit({ request, scope: 'student-class-join', identifier: user.id, maxHits: 12, windowSeconds: 60 * 60 })
  if (!allowed) return NextResponse.json({ error: 'Liittymisyrityksiä on liikaa. Yritä myöhemmin.' }, { status: 429 })
  const body = await request.json() as { code?: string }
  const code = String(body.code ?? '').trim().toUpperCase().slice(0, 32)
  if (code.length < 6) return NextResponse.json({ error: 'Tarkista liittymiskoodi.' }, { status: 400 })
  const { data: teacherClass } = await admin.from('teacher_classes').select('id,name,course_language,is_active').eq('join_code', code).maybeSingle()
  if (!teacherClass || teacherClass.is_active === false) return NextResponse.json({ error: 'Luokkaa ei löytynyt tällä koodilla.' }, { status: 404 })
  if (teacherClass.course_language !== profile.course_language) return NextResponse.json({ error: 'Luokka kuuluu eri kielikurssiin.' }, { status: 409 })
  const { error } = await admin.from('teacher_class_members').upsert({ class_id: teacherClass.id, student_id: user.id }, { onConflict: 'class_id,student_id' })
  if (error) return NextResponse.json({ error: 'Luokkaan liittyminen epäonnistui.' }, { status: 500 })
  await admin.from('security_audit_log').insert({ actor_user_id: user.id, event_type: 'student_joined_class', metadata: { classId: teacherClass.id } })
  return NextResponse.json({ ok: true, className: teacherClass.name })
}

