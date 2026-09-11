import Link from 'next/link'
import { requireRole } from '@/lib/auth/roles'

export default async function TeacherStudentsPage() {
  const { profile, supabase, user } = await requireRole(['teacher', 'admin'])
  const fi = profile.ui_language !== 'sv'

  const { data: classes } = await supabase.from('teacher_classes').select('id, name').eq('teacher_id', user.id)
  const classIds = classes?.map(c => c.id) ?? []
  const { data: memberships } = classIds.length
    ? await supabase.from('teacher_class_members').select('class_id, student_id').in('class_id', classIds)
    : { data: [] as { class_id: string; student_id: string }[] }

  const studentIds = [...new Set((memberships ?? []).map(m => m.student_id))]
  const { data: students } = studentIds.length
    ? await supabase.from('profiles').select('id, display_name, current_level, target_language').in('id', studentIds)
    : { data: [] as { id: string; display_name: string | null; current_level: string | null; target_language: string | null }[] }

  return (
    <main style={{maxWidth:1000,margin:'0 auto',padding:'32px 20px'}}>
      <p style={{letterSpacing:2,textTransform:'uppercase',opacity:.65}}>{fi ? 'OPETTAJAN TYÖTILA' : 'LÄRARARBETSYTA'}</p>
      <h1>{fi ? 'Opiskelijat' : 'Studerande'}</h1>
      <p>{fi ? 'Näet vain omiin luokkiisi liitetyt opiskelijat.' : 'Du ser endast studerande som hör till dina egna klasser.'}</p>
      <div style={{display:'grid',gap:12,marginTop:24}}>
        {students?.length ? students.map(s => (
          <Link key={s.id} href={`/teacher/students/${s.id}`} className="card">
            <strong>{s.display_name || (fi ? 'Opiskelija' : 'Studerande')}</strong>
            <div>{s.current_level ?? 'A0'} · {s.target_language === 'sv' ? 'Svenska' : 'Suomi'}</div>
          </Link>
        )) : <p>{fi ? 'Luokissa ei ole vielä opiskelijoita.' : 'Det finns ännu inga studerande i klasserna.'}</p>}
      </div>
    </main>
  )
}
