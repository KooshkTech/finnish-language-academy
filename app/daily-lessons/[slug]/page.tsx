import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { GeneratedLessonDraft } from '@/types/teacher-content'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Päivän oppitunti', robots: { index: false, follow: false } }

async function getLesson(slug:string) {
  const admin = createAdminClient(); if(!admin) return null
  const now = new Date().toISOString()
  const { data } = await admin.from('teacher_lesson_publications').select('id,slug,title,objective,cefr_level,skill,audience,target_class_id,target_student_id,status,publish_at,lesson_json').eq('slug',slug).in('status',['scheduled','published']).lte('publish_at',now).maybeSingle()
  if(!data) return null
  if(data.audience === 'public') return data
  const supabase = await createClient(); if(!supabase) return null
  const { data: authData } = await supabase.auth.getUser(); const userId = authData.user?.id; if(!userId) return null
  if(data.audience === 'student' && data.target_student_id === userId) return data
  if(data.audience === 'class' && data.target_class_id) {
    const { data: membership } = await admin.from('teacher_class_members').select('class_id').eq('class_id',data.target_class_id).eq('student_id',userId).maybeSingle()
    if(membership) return data
  }
  return null
}

export default async function DailyLessonPage({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params; const row = await getLesson(slug); if(!row) notFound()
  const lesson = row.lesson_json as GeneratedLessonDraft
  return <main className="daily-lesson-page"><div className="daily-lesson-inner"><Link href="/learn">← Takaisin oppimiseen</Link><header><p className="eyebrow">PÄIVÄN OPPITUNTI · {row.cefr_level} · {row.skill}</p><h1>{row.title}</h1><p>{row.objective}</p></header><section className="daily-lesson-content"><article><h2>Opi</h2><ul>{lesson.lesson.theory.map(item=><li key={item}>{item}</li>)}</ul>{lesson.lesson.examples.map(item=><div className="daily-example" key={item.target}><strong>{item.target}</strong><span>{item.translation}</span><small>{item.note}</small></div>)}</article><article><h2>Sanasto</h2><div className="daily-vocab-grid">{lesson.vocabulary.map(item=><div key={item.term}><strong>{item.term}</strong><span>{item.meaning}</span><small>{item.example}</small></div>)}</div></article><article><h2>Kielioppi</h2>{lesson.grammar.map(item=><div key={item.title}><h3>{item.title}</h3><p>{item.explanation}</p></div>)}</article><article><h2>Harjoitukset</h2><ol>{lesson.exercises.map((item,index)=><li key={`${item.prompt}-${index}`}><strong>{item.prompt}</strong><details><summary>Näytä vastaus</summary><p>{item.answer}</p><small>{item.explanation}</small></details></li>)}</ol></article><article><h2>Muistikortit</h2><div className="daily-vocab-grid">{lesson.flashcards.map(item=><div key={item.front}><strong>{item.front}</strong><span>{item.back}</span></div>)}</div></article><article><h2>Testi</h2><ol>{lesson.test.map((item,index)=><li key={`${item.prompt}-${index}`}><strong>{item.prompt}</strong><details><summary>Tarkista</summary><p>{item.answer}</p><small>{item.explanation}</small></details></li>)}</ol></article></section></div></main>
}

