import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type TeacherCheck =
  | { ok: true; userId: string; mfaLevel: 'aal1' | 'aal2'; courseLanguage: 'fi' | 'sv' }
  | { ok: false; reason: 'not-authenticated' | 'not-teacher' | 'not-approved' | 'mfa-required' | 'not-configured' }

export async function checkTeacherAccess(requireMfa = true): Promise<TeacherCheck> {
  const supabase = await createClient()
  const admin = createAdminClient()
  if (!supabase || !admin) return { ok: false, reason: 'not-configured' }

  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user
  if (!user) return { ok: false, reason: 'not-authenticated' }

  const [{ data: profile }, { data: access }] = await Promise.all([
    admin.from('profiles').select('role,course_language').eq('id', user.id).maybeSingle(),
    admin.from('teacher_access').select('status,mfa_required').eq('user_id', user.id).maybeSingle(),
  ])

  if (!profile || profile.role !== 'teacher') return { ok: false, reason: 'not-teacher' }
  if (!access || access.status !== 'active') return { ok: false, reason: 'not-approved' }

  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  const mfaLevel = assurance?.currentLevel === 'aal2' ? 'aal2' : 'aal1'
  if (requireMfa && access.mfa_required !== false && mfaLevel !== 'aal2') return { ok: false, reason: 'mfa-required' }

  return { ok: true, userId: user.id, mfaLevel, courseLanguage: profile.course_language === 'sv' ? 'sv' : 'fi' }
}

