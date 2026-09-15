import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function requireAdminAccess() {
  const supabase = await createClient()
  const admin = createAdminClient()
  if (!supabase || !admin) return { ok: false as const, reason: 'not-configured' as const }

  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false as const, reason: 'not-authenticated' as const }

  const { data: profile } = await admin.from('profiles').select('role').eq('id', authData.user.id).maybeSingle()
  if (!profile || profile.role !== 'admin') return { ok: false as const, reason: 'not-admin' as const }

  return { ok: true as const, userId: authData.user.id, admin }
}

