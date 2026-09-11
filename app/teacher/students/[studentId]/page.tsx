import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/roles'

export default async function TeacherStudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  const { profile, supabase, user } = await requireRole(['teacher', 'admin'])
  const fi = profile.ui_language !== 'sv'

  const { data: memberships } = await supabase
    .from('teacher_class_members')
    .select('class_id')
    .eq('student_id', studentId)

  const classIds = memberships?.map(m => m.class_id) ?? []
  const { data: ownedClass } = classIds.length
    ? await supabase.from('teacher_classes').select('id').eq('teacher_id', user.id).in('id', classIds).limit(1).maybeSingle()
    : { data: null }

  if (!ownedClass && profile.role !== 'admin') notFound()

  const [{ data: student }, { data: progress }, { data: attempts }, { data: words }] = await Promise.all([
    supabase.from('profiles').select('id, display_name, current_level, target_language, learning_goal').eq('id', studentId).single(),
    supabase.from('lesson_progress').select('lesson_slug, progress_percent, completed_at, updated_at').eq('user_id', studentId).order('updated_at', { ascending: false }).limit(20),
    supabase.from('exercise_attempts').select('exercise_id, grammar_topic, is_correct, attempted_at').eq('user_id', studentId).order('attempted_at', { ascending: false }).limit(30),
    supabase.from('vocabulary_progress').select('word, mastery, confidence, next_review').eq('user_id', studentId).order('mastery', { ascending: true }).limit(20),
  ])

  if (!student) notFound()

  return (
    <main style={{maxWidth:1100,margin:'0 auto',padding:'32px 20px'}}>
      <p style={{letterSpacing:2,textTransform:'uppercase',opacity:.65}}>{fi ? 'OPISKELIJAN EDISTYMINEN' : 'STUDERANDENS FRAMSTEG'}</p>
      <h1>{student.display_name || (fi ? 'Opiskelija' : 'Studerande')}</h1>
      <p>{student.current_level ?? 'A0'} · {student.target_language === 'sv' ? 'Svenska' : 'Suomi'} · {student.learning_goal ?? ''}</p>

      <section style={{marginTop:28}}>
        <h2>{fi ? 'Oppitunnit' : 'Lektioner'}</h2>
        {progress?.map(p => <div key={p.lesson_slug}>{p.lesson_slug} · {p.progress_percent}%</div>)}
      </section>

      <section style={{marginTop:28}}>
        <h2>{fi ? 'Viimeisimmät harjoitukset' : 'Senaste övningar'}</h2>
        {attempts?.map((a, i) => <div key={`${a.exercise_id}-${i}`}>{a.exercise_id} · {a.is_correct ? (fi ? 'Oikein' : 'Rätt') : (fi ? 'Kerrattava' : 'Behöver repeteras')} {a.grammar_topic ? `· ${a.grammar_topic}` : ''}</div>)}
      </section>

      <section style={{marginTop:28}}>
        <h2>{fi ? 'Sanasto, jota kannattaa kerrata' : 'Ordförråd att repetera'}</h2>
        {words?.map(w => <div key={w.word}>{w.word} · {w.mastery}%</div>)}
      </section>
    </main>
  )
}
