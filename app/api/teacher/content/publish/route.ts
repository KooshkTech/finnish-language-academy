import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'
import type { DailyLessonAudience, DailyLessonSkill } from '@/types/daily-lessons'
import type { GeneratedLessonDraft } from '@/types/teacher-content'

const skills = new Set<DailyLessonSkill>(['speaking','listening','reading','writing','understanding','vocabulary','yki-test','mixed'])
const audiences = new Set<DailyLessonAudience>(['public','class','student'])

type RequestBody = {
  draftId?: string
  action?: 'publish' | 'schedule' | 'unpublish' | 'archive'
  skill?: DailyLessonSkill
  publishAt?: string
  audience?: DailyLessonAudience
  targetClassId?: string | null
  targetStudentId?: string | null
  reviewConfirmed?: boolean
}

function slugify(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'lesson'
}

export async function POST(request: NextRequest) {
  const access = await checkTeacherAccess(true)
  if (!access.ok) return NextResponse.json({ error: access.reason === 'mfa-required' ? 'MFA vaaditaan.' : 'Opettajan käyttöoikeus vaaditaan.' }, { status: access.reason === 'mfa-required' ? 403 : 401 })

  const allowed = await enforceRateLimit({ request, scope: 'teacher-content-publish', identifier: access.userId, maxHits: 40, windowSeconds: 60 * 60 })
  if (!allowed) return NextResponse.json({ error: 'Julkaisuraja täyttyi. Yritä myöhemmin.' }, { status: 429 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })

  const body = await request.json() as RequestBody
  const draftId = String(body.draftId ?? '')
  const action = body.action ?? 'schedule'
  if (!draftId) return NextResponse.json({ error: 'Luonnos puuttuu.' }, { status: 400 })

  const { data: draft } = await admin.from('teacher_lesson_drafts')
    .select('id,teacher_id,language,cefr_level,title,draft_json,status')
    .eq('id', draftId).eq('teacher_id', access.userId).maybeSingle()
  if (!draft) return NextResponse.json({ error: 'Luonnosta ei löytynyt.' }, { status: 404 })

  if (action === 'unpublish' || action === 'archive') {
    const status = action === 'archive' ? 'archived' : 'unpublished'
    const { error } = await admin.from('teacher_lesson_publications').update({ status, updated_at: new Date().toISOString() }).eq('draft_id', draftId).eq('teacher_id', access.userId)
    if (error) return NextResponse.json({ error: 'Tilan päivitys epäonnistui.' }, { status: 500 })
    await admin.from('teacher_lesson_drafts').update({ status: action === 'archive' ? 'archived' : 'approved', updated_at: new Date().toISOString() }).eq('id', draftId)
    await admin.from('security_audit_log').insert({ actor_user_id: access.userId, event_type: `teacher_lesson_${status}`, metadata: { draftId } })
    return NextResponse.json({ ok: true, status })
  }

  if (body.reviewConfirmed !== true) return NextResponse.json({ error: 'Vahvista, että olet tarkistanut oppitunnin ennen julkaisua.' }, { status: 400 })

  const skill = body.skill ?? 'mixed'
  const audience = body.audience ?? 'public'
  if (!skills.has(skill) || !audiences.has(audience)) return NextResponse.json({ error: 'Taito tai kohderyhmä ei ole sallittu.' }, { status: 400 })

  let targetClassId: string | null = null
  let targetStudentId: string | null = null
  if (audience === 'class') {
    targetClassId = body.targetClassId ? String(body.targetClassId) : null
    if (!targetClassId) return NextResponse.json({ error: 'Valitse luokka.' }, { status: 400 })
    const { data: teacherClass } = await admin.from('teacher_classes').select('id').eq('id', targetClassId).eq('teacher_id', access.userId).maybeSingle()
    if (!teacherClass) return NextResponse.json({ error: 'Luokkaa ei löytynyt.' }, { status: 404 })
  }
  if (audience === 'student') {
    targetStudentId = body.targetStudentId ? String(body.targetStudentId) : null
    if (!targetStudentId) return NextResponse.json({ error: 'Valitse opiskelija.' }, { status: 400 })
    const { data: profile } = await admin.from('profiles').select('id,role').eq('id', targetStudentId).maybeSingle()
    if (!profile || profile.role !== 'student') return NextResponse.json({ error: 'Opiskelijaa ei löytynyt.' }, { status: 404 })
  }

  const now = new Date()
  const requestedDate = body.publishAt ? new Date(body.publishAt) : now
  if (Number.isNaN(requestedDate.getTime())) return NextResponse.json({ error: 'Julkaisuaika ei kelpaa.' }, { status: 400 })
  if (requestedDate.getTime() > now.getTime() + 366 * 24 * 60 * 60 * 1000) return NextResponse.json({ error: 'Julkaisuaika on liian kaukana tulevaisuudessa.' }, { status: 400 })
  const immediate = action === 'publish' || requestedDate.getTime() <= now.getTime()
  const publishAt = immediate ? now.toISOString() : requestedDate.toISOString()
  const generated = draft.draft_json as GeneratedLessonDraft
  const slug = `${slugify(draft.title)}-${String(draft.id).slice(0, 8)}`

  const publication = {
    draft_id: draft.id,
    teacher_id: access.userId,
    slug,
    language: draft.language,
    cefr_level: draft.cefr_level,
    skill,
    title: draft.title,
    objective: generated.objective ?? '',
    lesson_json: generated,
    status: immediate ? 'published' : 'scheduled',
    audience,
    target_class_id: targetClassId,
    target_student_id: targetStudentId,
    publish_at: publishAt,
    published_at: immediate ? now.toISOString() : null,
    updated_at: now.toISOString(),
  }

  const { data: saved, error } = await admin.from('teacher_lesson_publications').upsert(publication, { onConflict: 'draft_id' }).select('id,slug,status,publish_at,audience').single()
  if (error || !saved) return NextResponse.json({ error: 'Julkaisun tallennus epäonnistui.' }, { status: 500 })

  await admin.from('teacher_lesson_drafts').update({ status: immediate ? 'published' : 'approved', reviewed_at: now.toISOString(), published_at: immediate ? now.toISOString() : null, updated_at: now.toISOString() }).eq('id', draftId)
  await admin.from('security_audit_log').insert({ actor_user_id: access.userId, event_type: immediate ? 'teacher_lesson_published' : 'teacher_lesson_scheduled', metadata: { draftId, publicationId: saved.id, skill, audience, publishAt } })

  return NextResponse.json({ ok: true, publication: saved, message: immediate ? 'Oppitunti julkaistiin.' : 'Oppitunti ajastettiin.' })
}

