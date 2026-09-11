import Link from 'next/link'
import { requireRole } from '@/lib/auth/roles'

export default async function StudentPage() {
  const { profile, supabase, user } = await requireRole(['student'])

  const [{ data: progress }, { data: assignments }] = await Promise.all([
    supabase.from('user_lesson_progress').select('lesson_id, mastery_score, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5),
    supabase.from('assignments').select('id, title, due_at, class_id').order('due_at', { ascending: true }).limit(5),
  ])

  const fi = profile.ui_language !== 'sv'
  return (
    <main style={{maxWidth:1100,margin:'0 auto',padding:'32px 20px'}}>
      <p style={{letterSpacing:2,textTransform:'uppercase',opacity:.65}}>{fi ? 'OPISKELIJA' : 'STUDERANDE'}</p>
      <h1>{fi ? `Tervetuloa, ${profile.display_name ?? ''}` : `Välkommen, ${profile.display_name ?? ''}`}</h1>
      <p>{fi ? `Taso: ${profile.current_level ?? 'A0'} · Opiskeltava kieli: ${profile.target_language ?? 'fi'}` : `Nivå: ${profile.current_level ?? 'A0'} · Studiespråk: ${profile.target_language ?? 'fi'}`}</p>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:16,marginTop:28}}>
        <Link href="/learn" className="card">{fi ? 'Jatka oppimista' : 'Fortsätt lära'}</Link>
        <Link href="/review" className="card">{fi ? 'Tämän päivän kertaus' : 'Dagens repetition'}</Link>
        <Link href="/progress" className="card">{fi ? 'Edistyminen' : 'Framsteg'}</Link>
        <Link href="/yki" className="card">{fi ? 'YKI-harjoittelu' : 'YKI-övning'}</Link>
      </section>

      <section style={{marginTop:36}}>
        <h2>{fi ? 'Opettajan tehtävät' : 'Lärarens uppgifter'}</h2>
        {assignments?.length ? assignments.map(a => <article key={a.id} className="card"><strong>{a.title}</strong><div>{a.due_at ? new Date(a.due_at).toLocaleDateString(fi ? 'fi-FI' : 'sv-SE') : ''}</div></article>) : <p>{fi ? 'Ei avoimia tehtäviä.' : 'Inga öppna uppgifter.'}</p>}
      </section>

      <section style={{marginTop:36}}>
        <h2>{fi ? 'Viimeisin edistyminen' : 'Senaste framsteg'}</h2>
        {progress?.length ? progress.map((p, i) => <div key={`${p.lesson_id}-${i}`}>{p.lesson_id} · {p.mastery_score ?? 0}%</div>) : <p>{fi ? 'Aloita ensimmäinen oppitunti.' : 'Börja din första lektion.'}</p>}
      </section>
    </main>
  )
}
