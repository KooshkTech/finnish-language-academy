import Link from 'next/link'
import { requireRole } from '@/lib/auth/roles'

export default async function TeacherPage() {
  const { profile, supabase, user } = await requireRole(['teacher', 'admin'])
  const [{ data: classes }, { data: plans }, { data: assignments }] = await Promise.all([
    supabase.from('teacher_classes').select('id, name, class_type, cefr_level').eq('teacher_id', user.id).order('created_at', { ascending: false }).limit(8),
    supabase.from('recurring_lesson_plans').select('id, topic, frequency, next_run_at, is_active').eq('teacher_id', user.id).order('next_run_at', { ascending: true }).limit(8),
    supabase.from('assignments').select('id, title, due_at, class_id').eq('teacher_id', user.id).order('due_at', { ascending: true }).limit(8),
  ])

  const fi = profile.ui_language !== 'sv'
  return (
    <main style={{maxWidth:1200,margin:'0 auto',padding:'32px 20px'}}>
      <p style={{letterSpacing:2,textTransform:'uppercase',opacity:.65}}>{fi ? 'OPETTAJAN TYÖTILA' : 'LÄRARARBETSYTA'}</p>
      <h1>{fi ? 'Opettajan työpöytä' : 'Lärarens arbetsbord'}</h1>
      <p>{fi ? 'Hallitse luokkia, opiskelijoita, oppitunteja ja tekoälyavusteisia luonnoksia.' : 'Hantera klasser, studerande, lektioner och AI-stödda utkast.'}</p>

      <nav style={{display:'flex',gap:12,flexWrap:'wrap',margin:'24px 0'}}>
        <Link href="/teacher/classes">{fi ? 'Luokat' : 'Klasser'}</Link>
        <Link href="/teacher/students">{fi ? 'Opiskelijat' : 'Studerande'}</Link>
        <Link href="/teacher/content-studio">{fi ? 'Sisältöstudio' : 'Innehållsstudio'}</Link>
        <Link href="/teacher/calendar">{fi ? 'Kalenteri' : 'Kalender'}</Link>
      </nav>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:18}}>
        <article className="card"><h2>{fi ? 'Luokat' : 'Klasser'}</h2>{classes?.length ? classes.map(c => <div key={c.id}><strong>{c.name}</strong><div>{c.class_type} · {c.cefr_level}</div></div>) : <p>{fi ? 'Ei luokkia vielä.' : 'Inga klasser ännu.'}</p>}</article>
        <article className="card"><h2>{fi ? 'Ajastetut oppitunnit' : 'Schemalagda lektioner'}</h2>{plans?.length ? plans.map(p => <div key={p.id}><strong>{p.topic}</strong><div>{p.frequency} · {p.is_active ? (fi ? 'aktiivinen' : 'aktiv') : (fi ? 'tauolla' : 'pausad')}</div></div>) : <p>{fi ? 'Ei ajastuksia.' : 'Inga scheman.'}</p>}</article>
        <article className="card"><h2>{fi ? 'Avoimet tehtävät' : 'Öppna uppgifter'}</h2>{assignments?.length ? assignments.map(a => <div key={a.id}>{a.title}</div>) : <p>{fi ? 'Ei avoimia tehtäviä.' : 'Inga öppna uppgifter.'}</p>}</article>
      </section>

      <section style={{marginTop:32}}>
        <h2>{fi ? 'Tekoälyavusteinen oppitunnin luonti' : 'AI-stödd lektionsskapande'}</h2>
        <p>{fi ? 'Tekoäly tuottaa vain luonnoksen. Opettaja tarkistaa ja hyväksyy ennen julkaisua.' : 'AI skapar endast ett utkast. Läraren granskar och godkänner före publicering.'}</p>
        <Link href="/teacher/content-studio">{fi ? 'Luo uusi luonnos' : 'Skapa nytt utkast'}</Link>
      </section>
    </main>
  )
}
