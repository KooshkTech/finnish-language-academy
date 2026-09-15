import Link from 'next/link'
import { redirect } from 'next/navigation'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import TeacherClassCreateForm from '@/components/teacher/TeacherClassCreateForm'

export const metadata = { title: 'Luokat | OpiOpe', robots: { index: false, follow: false } }

export default async function TeacherClassesPage() {
  const access = await checkTeacherAccess(true)
  if (!access.ok) redirect(access.reason === 'mfa-required' ? '/teacher/security' : '/')
  const admin = createAdminClient(); if (!admin) redirect('/')
  const fi = access.courseLanguage === 'fi'
  const { data } = await admin.from('teacher_classes')
    .select('id,name,join_code,course_language,created_at')
    .eq('teacher_id', access.userId)
    .eq('course_language', access.courseLanguage)
    .order('created_at', { ascending: false })

  return <main className="teacher-dashboard-page">
    <header className="teacher-settings-header">
      <Link href="/teacher">{fi ? '← Opettajan työtila' : '← Lärararbetsyta'}</Link>
      <div>
        <p className="eyebrow">{fi ? 'LUOKAT' : 'KLASSER'}</p>
        <h1>{fi ? 'Opetusryhmät' : 'Undervisningsgrupper'}</h1>
        <p>{fi ? 'Luokan kautta näet vain siihen kuuluvat opiskelijat. Uudet luokat luodaan valitulle suomen kurssille.' : 'Via klassen ser du endast de studerande som hör till den. Nya klasser skapas för den valda svenskakursen.'}</p>
      </div>
    </header>
    <TeacherClassCreateForm language={access.courseLanguage} />
    <section>{data?.length ? data.map(c => <Link key={c.id} href={`/teacher/classes/${c.id}`} className="teacher-dashboard-card"><h2>{c.name}</h2><p>{fi ? 'Liittymiskoodi' : 'Anslutningskod'}: <strong>{c.join_code}</strong></p></Link>) : <p>{fi ? 'Luokkia ei ole vielä luotu. Luo ensimmäinen luokka yllä olevalla lomakkeella.' : 'Inga klasser har skapats ännu. Skapa den första klassen med formuläret ovan.'}</p>}</section>
  </main>
}

