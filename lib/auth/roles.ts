import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AppRole = 'student' | 'teacher' | 'admin'

export async function requireRole(allowed: AppRole[]) {
  const supabase = await createClient()
  if (!supabase) redirect('/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, display_name, ui_language, target_language, current_level')
    .eq('id', user.id)
    .single()

  if (!profile || !allowed.includes(profile.role as AppRole)) redirect('/login')
  return { supabase, user, profile }
}
