import { redirect } from 'next/navigation'
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard'
import { createClient } from '@/lib/supabase/server'

export default async function TeacherPage() {
  const supabase = await createClient()
  if (!supabase) return <TeacherDashboard teacherName="Opettaja" classes={[]} />
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/?auth=login')
  const { data: profile } = await supabase.from('profiles').select('display_name, role').eq('id', user.id).maybeSingle()
  if (!profile || !['teacher', 'admin'].includes(profile.role)) redirect('/')
  const { data: classes } = await supabase.from('teacher_classes').select('id, name, class_type, target_language, cefr_level, join_code').eq('teacher_id', user.id).order('created_at', { ascending: false })
  return <TeacherDashboard teacherName={profile.display_name ?? 'Opettaja'} classes={classes ?? []} />
}
