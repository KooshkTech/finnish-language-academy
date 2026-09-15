import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpenCheck, CalendarDays, Settings2, ShieldCheck, UploadCloud, Users, Sparkles } from 'lucide-react'
import { checkTeacherAccess } from '@/lib/security/teacher'
import SignOutButton from '@/components/auth/SignOutButton'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import { createAdminClient } from '@/lib/supabase/admin'
import TeacherOperationsSummary from '@/components/teacher/TeacherOperationsSummary'

export const metadata = { title: 'Opettajan työtila | OpiOpe', robots: { index: false, follow: false } }

export default async function TeacherDashboardPage() {
  const access = await checkTeacherAccess(true)
  if (!access.ok) {
    if (access.reason === 'mfa-required') redirect('/teacher/security')
    redirect('/')
  }
  const fi = access.courseLanguage === 'fi'
  const admin = createAdminClient()
  const [{data:notifications},{count:classCount},{data:ownedClasses},{count:sessionCount}]=admin?await Promise.all([admin.from('user_notifications').select('id,title,body,link_path,read_at,created_at').eq('user_id',access.userId).order('created_at',{ascending:false}).limit(12),admin.from('teacher_classes').select('id',{count:'exact',head:true}).eq('teacher_id',access.userId).eq('course_language',access.courseLanguage),admin.from('teacher_classes').select('id').eq('teacher_id',access.userId).eq('course_language',access.courseLanguage),admin.from('class_sessions').select('id',{count:'exact',head:true}).eq('teacher_id',access.userId).eq('course_language',access.courseLanguage).eq('status','scheduled').gte('starts_at',new Date().toISOString())]):[{data:[]},{count:0},{data:[]},{count:0}]
  const classIds=(ownedClasses??[]).map(row=>row.id);const {count:studentCount}=admin&&classIds.length?await admin.from('teacher_class_members').select('student_id',{count:'exact',head:true}).in('class_id',classIds):{count:0}
  return <main className="teacher-dashboard-page">
    <header className="teacher-settings-header">
      <div style={{display:'flex',gap:12,alignItems:'center'}}><Link href="/">← OpiOpe</Link><SignOutButton language={access.courseLanguage} /></div>
      <div>
        <p className="eyebrow">{fi ? 'OPETTAJAN TYÖTILA' : 'LÄRARARBETSYTA'}</p>
        <h1>{fi ? 'Opeta, rakenna ja tarkista.' : 'Undervisa, skapa och följ upp.'}</h1>
        <p>{fi ? 'Hallinnoi luokkia, opiskelijoita, oppitunteja, tehtäviä ja turvallisuutta yhdestä työtilasta.' : 'Hantera klasser, studerande, lektioner, uppgifter och säkerhet från en arbetsyta.'}</p>
      </div>
    </header>
    <TeacherOperationsSummary language={access.courseLanguage} classes={classCount??0} students={studentCount??0} sessions={sessionCount??0} unread={(notifications??[]).filter(n=>!n.read_at).length}/>
    <section id="notifications" style={{marginBottom:28}}>
      <div className="student-progress-heading"><div><p className="eyebrow">{fi?'ILMOITUKSET':'AVISERINGAR'}</p><h2>{fi?'Ajankohtaista':'Aktuellt'}</h2></div><strong>{(notifications??[]).filter(n=>!n.read_at).length} {fi?'uutta':'nya'}</strong></div>
      <NotificationCenter items={notifications ?? []} language={access.courseLanguage} />
    </section>
    <section className="teacher-dashboard-grid">
      <Link href="/teacher/classes" className="teacher-dashboard-card"><Users/><small>01</small><h2>{fi ? 'Luokat ja opiskelijat' : 'Klasser och studerande'}</h2><p>{fi ? 'Hallinnoi opetusryhmiä ja tarkastele vain omiin luokkiisi kuuluvien opiskelijoiden edistymistä.' : 'Hantera undervisningsgrupper och se endast framsteg för studerande i dina egna klasser.'}</p><strong>{fi ? 'Avaa luokat' : 'Öppna klasser'} →</strong></Link>
      <Link href="/teacher/content-studio" className="teacher-dashboard-card"><Sparkles/><small>02</small><h2>{fi ? 'Tekoälyavusteiset oppitunnit' : 'AI-stödda lektioner'}</h2><p>{fi ? 'Luo tarkistettavia oppituntiluonnoksia. Luonnos julkaistaan vasta opettajan hyväksynnän jälkeen.' : 'Skapa lektionsutkast för granskning. Ett utkast publiceras först efter lärarens godkännande.'}</p><strong>{fi ? 'Luo luonnos' : 'Skapa utkast'} →</strong></Link>
      <Link href="/teacher/content-studio" className="teacher-dashboard-card"><UploadCloud/><small>03</small><h2>{fi ? 'Sisältöstudio' : 'Innehållsstudio'}</h2><p>{fi ? 'Lataa oma materiaali ja rakenna siitä oppitunti, sanasto, kielioppi, harjoitukset, muistikortit ja testi.' : 'Ladda upp eget material och bygg en lektion med ordförråd, grammatik, övningar, minneskort och test.'}</p><strong>{fi ? 'Avaa studio' : 'Öppna studion'} →</strong></Link>
      <Link href="/teacher/calendar" className="teacher-dashboard-card"><CalendarDays/><small>04</small><h2>{fi ? 'Kalenteri ja live-tunnit' : 'Kalender och livelektioner'}</h2><p>{fi ? 'Ajasta sisältö- ja live-tunnit sekä seuraa luokkien aikatauluja ja läsnäoloa.' : 'Schemalägg innehåll och livelektioner samt följ klassernas tider och närvaro.'}</p><strong>{fi ? 'Avaa kalenteri' : 'Öppna kalendern'} →</strong></Link>
      <Link href="/teacher/settings" className="teacher-dashboard-card"><Settings2/><small>05</small><h2>{fi ? 'Opetusasetukset' : 'Undervisningsinställningar'}</h2><p>{fi ? 'Säädä näkymää, palautetta ja oppimistyökaluja.' : 'Justera vy, återkoppling och lärverktyg.'}</p><strong>{fi ? 'Avaa asetukset' : 'Öppna inställningar'} →</strong></Link>
      <Link href="/teacher/security" className="teacher-dashboard-card"><ShieldCheck/><small>06</small><h2>{fi ? 'Turvallisuus' : 'Säkerhet'}</h2><p>{fi ? 'Hallinnoi monivaiheista tunnistautumista ja opettajatilin suojausta.' : 'Hantera flerfaktorsautentisering och skyddet för lärarkontot.'}</p><strong>{fi ? 'Avaa turvallisuus' : 'Öppna säkerhet'} →</strong></Link>
      <Link href={`/course/${access.courseLanguage}/levels`} className="teacher-dashboard-card"><BookOpenCheck/><small>07</small><h2>{fi ? 'Oppijan näkymä' : 'Studerandevy'}</h2><p>{fi ? 'Tarkista, miltä A0–C2-polut näyttävät opiskelijan näkökulmasta.' : 'Kontrollera hur A0–C2-stigarna ser ut ur den studerandes perspektiv.'}</p><strong>{fi ? 'Esikatsele' : 'Förhandsgranska'} →</strong></Link>
    </section>
  </main>
}

