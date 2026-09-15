import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'

export async function GET() {
  const access = await checkTeacherAccess(true)
  if (!access.ok) return NextResponse.json({ error: 'Opettajan käyttöoikeus vaaditaan.' }, { status: access.reason === 'mfa-required' ? 403 : 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })
  const { data, error } = await admin.from('teacher_classes').select('id,name,join_code,course_language,created_at').eq('teacher_id', access.userId).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Luokkien lataus epäonnistui.' }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: NextRequest) {
  const access = await checkTeacherAccess(true)
  if (!access.ok) return NextResponse.json({ error: 'Opettajan käyttöoikeus vaaditaan.' }, { status: access.reason === 'mfa-required' ? 403 : 401 })
  const allowed = await enforceRateLimit({ request, scope: 'teacher-class-create', identifier: access.userId, maxHits: 20, windowSeconds: 24 * 60 * 60 })
  if (!allowed) return NextResponse.json({ error: 'Luokkien luontiraja täyttyi.' }, { status: 429 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })
  const body = await request.json() as { name?: string }
  const name = String(body.name ?? '').trim().slice(0, 120)
  if (name.length < 2) return NextResponse.json({ error: 'Anna luokalle nimi.' }, { status: 400 })
  const joinCode = randomBytes(5).toString('hex').toUpperCase()
  const { data, error } = await admin.from('teacher_classes').insert({ teacher_id: access.userId, name, join_code: joinCode, course_language: access.courseLanguage }).select('id,name,join_code,course_language,created_at').single()
  if (error || !data) return NextResponse.json({ error: 'Luokan luonti epäonnistui.' }, { status: 500 })
  await admin.from('security_audit_log').insert({ actor_user_id: access.userId, event_type: 'teacher_class_created', metadata: { classId: data.id } })
  return NextResponse.json({ item: data })
}

