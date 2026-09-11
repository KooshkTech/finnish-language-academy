import { requireRole } from '@/lib/auth/roles'

export default async function TeacherClassesPage() {
  const { profile, supabase, user } = await requireRole(['teacher', 'admin'])
  const fi = profile.ui_language !== 'sv'
  const { data: classes } = await supabase.from('teacher_classes').select('id, name, class_type, cefr_level, join_code, is_active').eq('teacher_id', user.id).order('created_at', { ascending: false })

  return (
    <main style={{maxWidth:1000,margin:'0 auto',padding:'32px 20px'}}>
      <p style={{letterSpacing:2,textTransform:'uppercase',opacity:.65}}>{fi ? 'OPETTAJAN TYÖTILA' : 'LÄRARARBETSYTA'}</p>
      <h1>{fi ? 'Luokat' : 'Klasser'}</h1>
      <p>{fi ? 'Luokat yhdistävät opettajan, opiskelijat, oppitunnit ja tehtävät.' : 'Klasser kopplar samman läraren, studerande, lektioner och uppgifter.'}</p>
      <div style={{display:'grid',gap:14,marginTop:24}}>
        {classes?.length ? classes.map(c => (
          <article key={c.id} className="card">
            <strong>{c.name}</strong>
            <div>{c.class_type} · {c.cefr_level}</div>
            <div>{fi ? 'Liittymiskoodi' : 'Anslutningskod'}: <code>{c.join_code}</code></div>
          </article>
        )) : <p>{fi ? 'Ei luokkia vielä.' : 'Inga klasser ännu.'}</p>}
      </div>
    </main>
  )
}
