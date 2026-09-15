import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ items: [], configured: false })
  const now = new Date().toISOString()
  const fields = 'id,slug,language,cefr_level,skill,title,objective,status,audience,publish_at,published_at'
  const { data: publicItems } = await admin.from('teacher_lesson_publications').select(fields)
    .eq('audience', 'public').in('status', ['scheduled','published']).lte('publish_at', now).order('publish_at', { ascending: false }).limit(12)

  const supabase = await createClient()
  const { data: authData } = supabase ? await supabase.auth.getUser() : { data: { user: null } }
  const userId = authData.user?.id
  let assigned: typeof publicItems = []
  if (userId) {
    const [{ data: direct }, { data: memberships }] = await Promise.all([
      admin.from('teacher_lesson_publications').select(fields).eq('audience','student').eq('target_student_id', userId).in('status',['scheduled','published']).lte('publish_at', now).order('publish_at',{ascending:false}).limit(12),
      admin.from('teacher_class_members').select('class_id').eq('student_id', userId),
    ])
    const classIds = (memberships ?? []).map(item => String(item.class_id))
    let classItems: typeof publicItems = []
    if (classIds.length) {
      const result = await admin.from('teacher_lesson_publications').select(fields).eq('audience','class').in('target_class_id', classIds).in('status',['scheduled','published']).lte('publish_at', now).order('publish_at',{ascending:false}).limit(12)
      classItems = result.data ?? []
    }
    assigned = [...(direct ?? []), ...(classItems ?? [])]
  }

  const merged = [...(assigned ?? []), ...(publicItems ?? [])]
  const unique = Array.from(new Map(merged.map(item => [item.id, item])).values()).slice(0, 16)
  return NextResponse.json({ items: unique, configured: true })
}

