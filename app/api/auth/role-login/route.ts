import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { enforceRateLimit } from '@/lib/security/rate-limit'

type LoginRole = 'student' | 'teacher' | 'free'
type LoginBody = { username?: string; password?: string; role?: LoginRole; courseLanguage?: 'fi' | 'sv' }

function messages(language: 'fi' | 'sv' | undefined) {
  const fi = language !== 'sv'
  return {
    generic: fi ? 'Kirjautuminen epäonnistui. Tarkista käyttäjätunnus ja salasana.' : 'Inloggningen misslyckades. Kontrollera användarnamn och lösenord.',
    rate: fi ? 'Liian monta kirjautumisyritystä. Yritä myöhemmin uudelleen.' : 'För många inloggningsförsök. Försök igen senare.',
    config: fi ? 'Kirjautuminen ei ole vielä tuotantokonfiguroitu.' : 'Inloggningen är ännu inte produktionskonfigurerad.',
    pending: fi ? 'Opettajahakemus odottaa ylläpidon hyväksyntää.' : 'Läraransökan väntar på administratörens godkännande.',
    rejected: fi ? 'Opettajahakemusta ei hyväksytty. Ota yhteyttä ylläpitoon.' : 'Läraransökan godkändes inte. Kontakta administratören.',
  }
}

export async function POST(request: Request) {
  let body: LoginBody
  try { body = await request.json() as LoginBody } catch { return NextResponse.json({ error: 'Virheellinen pyyntö.' }, { status: 400 }) }
  const copy = messages(body.courseLanguage)
  const username = body.username?.trim().toLowerCase()
  const password = body.password ?? ''
  const role = body.role

  if (!username || !password || (role !== 'student' && role !== 'teacher' && role !== 'free')) {
    return NextResponse.json({ error: copy.generic }, { status: 400 })
  }

  const allowed = await enforceRateLimit({ request, scope: 'role-login', identifier: username, maxHits: 7, windowSeconds: 15 * 60 })
  if (!allowed) return NextResponse.json({ error: copy.rate }, { status: 429 })

  const supabase = await createClient()
  const admin = createAdminClient()
  if (!supabase || !admin) return NextResponse.json({ error: copy.config }, { status: 503 })

  let email: string | null = username.includes('@') ? username : null
  let expectedUserId: string | null = null

  if (!email) {
    const { data: profile } = await admin.from('profiles').select('id,role,account_mode').eq('username', username).maybeSingle()
    if (role === 'teacher' && profile?.account_mode === 'teacher_pending') {
      const { data: application } = await admin.from('teacher_applications').select('status').eq('user_id', profile.id).maybeSingle()
      const pendingMessage = application?.status === 'rejected' ? copy.rejected : copy.pending
      return NextResponse.json({ error: pendingMessage, pending: true }, { status: 403 })
    }
    const lookupRole = role === 'free' ? 'student' : role
    if (!profile || profile.role !== lookupRole || (role === 'free' && profile.account_mode !== 'free') || (role === 'student' && profile.account_mode === 'free')) return NextResponse.json({ error: copy.generic }, { status: 401 })
    expectedUserId = profile.id

    if (role === 'teacher') {
      const { data: access } = await admin.from('teacher_access').select('status').eq('user_id', profile.id).maybeSingle()
      if (!access || access.status !== 'active') return NextResponse.json({ error: copy.generic }, { status: 401 })
    }

    const { data: userResult } = await admin.auth.admin.getUserById(profile.id)
    email = userResult.user?.email ?? null
    if (!email) return NextResponse.json({ error: copy.generic }, { status: 401 })
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user || (expectedUserId && expectedUserId !== data.user.id)) {
    return NextResponse.json({ error: copy.generic }, { status: 401 })
  }

  const [{ data: profile }, { data: teacherAccess }] = await Promise.all([
    admin.from('profiles').select('role,account_mode,course_language').eq('id', data.user.id).maybeSingle(),
    role === 'teacher' ? admin.from('teacher_access').select('status,mfa_required').eq('user_id', data.user.id).maybeSingle() : Promise.resolve({ data: null }),
  ])

  if (role === 'teacher' && profile?.account_mode === 'teacher_pending') {
    await supabase.auth.signOut()
    const { data: application } = await admin.from('teacher_applications').select('status').eq('user_id', data.user.id).maybeSingle()
    const pendingMessage = application?.status === 'rejected' ? copy.rejected : copy.pending
    return NextResponse.json({ error: pendingMessage, pending: true, redirectTo: '/teacher/application' }, { status: 403 })
  }

  const expectedRole = role === 'free' ? 'student' : role
  if (!profile || profile.role !== expectedRole || (role === 'free' && profile.account_mode !== 'free') || (role === 'teacher' && (!teacherAccess || teacherAccess.status !== 'active'))) {
    await supabase.auth.signOut()
    return NextResponse.json({ error: copy.generic }, { status: 401 })
  }

  if (role === 'teacher') {
    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    const hasAal2 = assurance?.currentLevel === 'aal2'
    await admin.from('security_audit_log').insert({ actor_user_id: data.user.id, event_type: 'teacher_login_password_ok', metadata: { mfa: hasAal2 ? 'aal2' : 'required' } })
    return NextResponse.json({ ok: true, redirectTo: hasAal2 || teacherAccess?.mfa_required === false ? '/teacher' : '/teacher/security', requiresMfa: !hasAal2 })
  }

  const courseLanguage = profile.course_language === 'sv' ? 'sv' : 'fi'
  return NextResponse.json({ ok: true, redirectTo: role === 'free' ? `/course/${courseLanguage}/levels` : '/student' })
}

