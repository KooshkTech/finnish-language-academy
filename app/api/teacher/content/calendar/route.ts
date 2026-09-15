import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const access = await checkTeacherAccess(true)
  if (!access.ok) return NextResponse.json({ error: 'Opettajan käyttöoikeus vaaditaan.' }, { status: access.reason === 'mfa-required' ? 403 : 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })
  const now = new Date().toISOString()
  await admin.from('teacher_lesson_publications').update({ status: 'published', published_at: now, updated_at: now }).eq('teacher_id', access.userId).eq('status', 'scheduled').lte('publish_at', now)
  const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get('limit') ?? 60), 1), 120)
  const { data, error } = await admin.from('teacher_lesson_publications')
    .select('id,draft_id,slug,language,cefr_level,skill,title,status,audience,target_class_id,target_student_id,publish_at,published_at,created_at,updated_at')
    .eq('teacher_id', access.userId).order('publish_at', { ascending: false }).limit(limit)
  if (error) return NextResponse.json({ error: 'Kalenterin lataus epäonnistui.' }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

