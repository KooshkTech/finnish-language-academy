import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { JoinClassForm } from '@/components/JoinClassForm'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = { title: 'Liity opettajan luokkaan', robots: { index: false, follow: false } }

export default async function JoinClassPage(){
  const supabase = await createClient(); const admin = createAdminClient()
  if (!supabase || !admin) return <JoinClassForm language="fi" />
  const { data } = await supabase.auth.getUser(); const user = data.user
  if (!user) redirect('/login/student')
  const { data: profile } = await admin.from('profiles').select('role,course_language,account_mode').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'student' || profile.account_mode === 'free') redirect('/')
  return <JoinClassForm language={profile.course_language === 'sv' ? 'sv' : 'fi'} />
}

