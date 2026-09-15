import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function TeacherApplicationPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/')

  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect('/')

  const [{ data: profile }, { data: application }] = await Promise.all([
    supabase.from('profiles').select('display_name,course_language,account_mode,role').eq('id', authData.user.id).maybeSingle(),
    supabase.from('teacher_applications').select('status,course_language,created_at,reviewed_at').eq('user_id', authData.user.id).maybeSingle(),
  ])

  const fi = profile?.course_language !== 'sv'
  if (profile?.role === 'teacher') redirect('/teacher')

  const status = application?.status ?? 'pending'
  const statusLabel = fi
    ? status === 'approved' ? 'Hyväksytty' : status === 'rejected' ? 'Hylätty' : 'Odottaa hyväksyntää'
    : status === 'approved' ? 'Godkänd' : status === 'rejected' ? 'Avslagen' : 'Väntar på godkännande'

  return (
    <main className="student-register-shell">
      <header className="student-register-header">
        <Link href={`/course/${profile?.course_language === 'sv' ? 'sv' : 'fi'}`}>{fi ? '← Takaisin' : '← Tillbaka'}</Link>
        <div>
          <p className="eyebrow">{fi ? 'OPETTAJAHAKEMUS' : 'LÄRARANSÖKAN'}</p>
          <h1>{fi ? 'Opettajatilin tila' : 'Status för lärarkonto'}</h1>
          <p>{profile?.display_name ?? authData.user.email}</p>
        </div>
      </header>
      <section className="student-register-form">
        <h2>{statusLabel}</h2>
        <p>{fi
          ? status === 'rejected'
            ? 'Hakemusta ei hyväksytty. Ota yhteyttä ylläpitoon, jos tarvitset lisätietoja.'
            : 'Sähköpostisi on vahvistettu. Opettajan oikeudet aktivoidaan vasta ylläpidon hyväksynnän jälkeen.'
          : status === 'rejected'
            ? 'Ansökan godkändes inte. Kontakta administrationen om du behöver mer information.'
            : 'Din e-post är bekräftad. Lärarbehörigheten aktiveras först efter administratörens godkännande.'}
        </p>
        <p>{fi ? 'Voit kirjautua opettajana hyväksynnän jälkeen.' : 'Du kan logga in som lärare efter godkännande.'}</p>
      </section>
    </main>
  )
}

