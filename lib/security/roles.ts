import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type AppRole = 'student' | 'teacher' | 'admin'

export async function requireRole(roles: AppRole[]) {
  const supabase = await createClient()
  const admin = createAdminClient()
  if (!supabase || !admin) redirect('/')
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect('/')
  const { data: profile } = await admin.from('profiles').select('id,display_name,username,role,ui_language,target_language,current_level,learning_goal,course_language,account_mode').eq('id', authData.user.id).maybeSingle()
  if (!profile || !roles.includes(profile.role as AppRole)) redirect('/')
  return { supabase, admin, user: authData.user, profile }
}

