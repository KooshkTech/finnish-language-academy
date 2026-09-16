/* eslint-disable react-hooks/purity -- server-rendered deadline state is evaluated per request. */
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import TeacherAssignmentForm from '@/components/assignments/TeacherAssignmentForm'
import ClassRosterControls from '@/components/teacher/ClassRosterControls'
import ClassJoinCodeControls from '@/components/teacher/ClassJoinCodeControls'
import ClassAnnouncementForm from '@/components/communication/ClassAnnouncementForm'
import ClassInvitationForm from '@/components/communication/ClassInvitationForm'
import ClassSessionForm from '@/components/teacher/ClassSessionForm'
import ClassFeedPostForm from '@/components/community/ClassFeedPostForm'

type StudentProfile = {
  id: string
  display_name: string | null
  username: string | null
  current_level: string | null
  course_language: string | null
}

export const metadata = { title: 'Luokka | OpiOpe', robots: { index: false, follow: false } }

export default async function TeacherClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params
  const access = await checkTeacherAccess(true)
  if (!access.ok) redirect(access.reason === 'mfa-required' ? '/teacher/security' : '/')
  const admin = createAdminClient(); if (!admin) redirect('/')
  const fi = access.courseLanguage === 'fi'

  const { data: teacherClass } = await admin.from('teacher_classes')
    .select('id,name,join_code,course_language')
    .eq('id', classId)
    .eq('teacher_id', access.userId)
    .eq('course_language', access.courseLanguage)
    .maybeSingle()
  if (!teacherClass) notFound()

  const [{ data: members }, { data: assignments }, { data: otherClasses }, { data: sessions }] = await Promise.all([
    admin.from('teacher_class_members').select('student_id,joined_at').eq('class_id', classId),
    admin.from('teacher_assignments').select('id,title,cefr_level,due_at,status,created_at').eq('class_id', classId).eq('teacher_id', access.userId).order('created_at',{ascending:false}).limit(30),
    admin.from('teacher_classes').select('id,name').eq('teacher_id', access.userId).eq('course_language', access.courseLanguage).neq('id', classId).order('name'),
    admin.from('class_sessions').select('id,title,starts_at,ends_at,status,location_text').eq('class_id',classId).eq('teacher_id',access.userId).order('starts_at',{ascending:true}).limit(30),
  ])
  const ids = members?.map(m => m.student_id) ?? []
  const assignmentIds = assignments?.map(a => a.id) ?? []
  const { data: classSubmissions } = assignmentIds.length
    ? await admin.from('assignment_submissions').select('assignment_id,status,student_id').in('assignment_id', assignmentIds)
    : { data: [] as {assignment_id:string;status:string;student_id:string}[] }
  const assignmentStats = new Map<string,{submitted:number;reviewed:number}>()
  for (const row of classSubmissions ?? []) { const current=assignmentStats.get(row.assignment_id)??{submitted:0,reviewed:0}; current.submitted+=1; if(row.status==='reviewed') current.reviewed+=1; assignmentStats.set(row.assignment_id,current) }
  const { data: profiles } = ids.length
    ? await admin.from('profiles').select('id,display_name,username,current_level,course_language').in('id', ids)
    : { data: [] as StudentProfile[] }
  const [{ data: announcements }, { data: invitations }, { data: feedPosts }] = await Promise.all([
    admin.from('class_announcements').select('id,title,body,created_at').eq('class_id', classId).order('created_at',{ascending:false}).limit(12),
    admin.from('class_invitations').select('id,invite_token,target_student_id,status,expires_at,created_at').eq('class_id',classId).eq('status','pending').order('created_at',{ascending:false}).limit(12),
    admin.from('class_feed_posts').select('id,title,body,link_path,is_pinned,comments_enabled,created_at').eq('class_id',classId).order('is_pinned',{ascending:false}).order('created_at',{ascending:false}).limit(30),
  ])

  return <main className="teacher-dashboard-page">
    <header className="teacher-settings-header">
      <Link href="/teacher/classes">{fi ? '← Luokat' : '← Klasser'}</Link>
      <div>
        <p className="eyebrow">{fi ? 'LUOKKA' : 'KLASS'}</p>
        <h1>{teacherClass.name}</h1>
        <p>{fi ? 'Liittymiskoodi' : 'Anslutningskod'}</p>
        <ClassJoinCodeControls classId={classId} joinCode={teacherClass.join_code} language={access.courseLanguage} />
      </div>
    </header>
    <section style={{marginBottom:28}}>
      <Link href={`/teacher/classes/${classId}/analytics`} className="teacher-dashboard-card" style={{display:'block'}}>
        <p className="eyebrow">{fi ? 'ANALYTIIKKA' : 'ANALYS'}</p>
        <h2>{fi ? 'Luokan suorituskyky' : 'Klassens prestation'}</h2>
        <p>{fi ? 'Tarkastele edistymistä, aktiivisuutta, heikkoja taitoja, tehtävien keskiarvoja ja opiskelijoita, jotka tarvitsevat huomiota.' : 'Se framsteg, aktivitet, svaga färdigheter, uppgiftsmedel och studerande som behöver uppmärksamhet.'}</p>
        <strong>{fi ? 'Avaa analytiikka' : 'Öppna analys'} →</strong>
      </Link>
    </section>
    <section>
      <h2>{fi ? 'Opiskelijat' : 'Studerande'}</h2>
      {profiles?.length ? (profiles as StudentProfile[]).map((p) => { const studentName=p.display_name ?? p.username ?? (fi ? 'Opiskelija' : 'Studerande'); return <article className="teacher-dashboard-card" key={p.id}><Link href={`/teacher/students/${p.id}`}><h3>{studentName}</h3><p>{fi ? 'Taso' : 'Nivå'}: {p.current_level ?? 'A0'} · {fi ? 'Kurssi' : 'Kurs'}: {p.course_language === 'sv' ? (fi ? 'Ruotsi' : 'Svenska') : (fi ? 'Suomi' : 'Finska')}</p></Link><div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}><Link href={`/teacher/classes/${classId}/messages/${p.id}`}>{fi ? 'Viestit' : 'Meddelanden'} →</Link><ClassRosterControls classId={classId} studentId={p.id} studentName={studentName} language={access.courseLanguage} moveTargets={otherClasses ?? []}/></div></article> }) : <p>{fi ? 'Luokassa ei ole vielä opiskelijoita.' : 'Klassen har ännu inga studerande.'}</p>}
    </section>

    <section style={{marginTop:32}}>
      <p className="eyebrow">{fi ? 'LUOKAN SYÖTE' : 'KLASSFLÖDE'}</p>
      <h2>{fi ? 'Yhteisö ja ajankohtaiset julkaisut' : 'Gemenskap och aktuella inlägg'}</h2>
      <div className="teacher-dashboard-grid"><ClassFeedPostForm classId={classId} language={access.courseLanguage}/></div>
      <div style={{marginTop:22}}>{feedPosts?.length ? feedPosts.map(post=><article key={post.id} className="teacher-dashboard-card" style={{marginTop:10}}>{post.is_pinned?<strong>📌 {fi?'Kiinnitetty':'Fäst'}</strong>:null}<h3>{post.title}</h3><p>{post.body}</p>{post.link_path?<Link href={post.link_path}>{fi?'Avaa linkki':'Öppna länk'} →</Link>:null}<small style={{display:'block',marginTop:8}}>{new Date(post.created_at).toLocaleString(fi?'fi-FI':'sv-SE')} · {post.comments_enabled?(fi?'Kommentit käytössä':'Kommentarer på'):(fi?'Kommentit pois':'Kommentarer av')}</small></article>) : <p>{fi?'Syötteessä ei ole vielä julkaisuja.':'Flödet har inga inlägg ännu.'}</p>}</div>
    </section>

    <section style={{marginTop:32}}>
      <p className="eyebrow">{fi ? 'VIESTINTÄ' : 'KOMMUNIKATION'}</p>
      <h2>{fi ? 'Kutsut ja ilmoitukset' : 'Inbjudningar och klassmeddelanden'}</h2>
      <div className="teacher-dashboard-grid">
        <ClassInvitationForm classId={classId} language={access.courseLanguage} />
        <ClassAnnouncementForm classId={classId} language={access.courseLanguage} />
      </div>
      {invitations?.length ? <div style={{marginTop:18}}><h3>{fi ? 'Aktiiviset kutsut' : 'Aktiva inbjudningar'}</h3>{invitations.map(inv => <div key={inv.id} className="teacher-dashboard-card" style={{marginTop:8}}><code>{`/join-class/invite/${inv.invite_token}`}</code><p>{fi ? 'Voimassa asti' : 'Giltig till'}: {new Date(inv.expires_at).toLocaleString(fi ? 'fi-FI' : 'sv-SE')}</p></div>)}</div> : null}
      <div style={{marginTop:22}}><h3>{fi ? 'Viimeisimmät ilmoitukset' : 'Senaste klassmeddelanden'}</h3>{announcements?.length ? announcements.map(a => <article key={a.id} className="teacher-dashboard-card" style={{marginTop:8}}><h3>{a.title}</h3><p>{a.body}</p><small>{new Date(a.created_at).toLocaleString(fi ? 'fi-FI' : 'sv-SE')}</small></article>) : <p>{fi ? 'Ei ilmoituksia vielä.' : 'Inga meddelanden ännu.'}</p>}</div>
    </section>

    <section style={{marginTop:32}}>
      <p className="eyebrow">{fi ? 'KALENTERI JA LIVE-TUNNIT' : 'KALENDER OCH LIVELEKTIONER'}</p>
      <h2>{fi ? 'Ajastetut tunnit' : 'Schemalagda lektioner'}</h2>
      <p><Link href={`/teacher/classes/${classId}/attendance`}>{fi?'Avaa läsnäoloraportti':'Öppna närvarorapport'} →</Link></p>
      <div className="teacher-dashboard-grid"><ClassSessionForm classId={classId} language={access.courseLanguage} /></div>
      <div style={{marginTop:22}}>{sessions?.length ? sessions.map(session => <Link key={session.id} href={`/teacher/classes/${classId}/sessions/${session.id}`} className="teacher-dashboard-card" style={{display:'block',marginTop:10}}><h3>{session.title}</h3><p>{new Date(session.starts_at).toLocaleString(fi?'fi-FI':'sv-SE')} · {session.status==='scheduled'?(fi?'Ajastettu':'Schemalagd'):session.status==='completed'?(fi?'Päättynyt':'Avslutad'):(fi?'Peruttu':'Inställd')}</p>{session.location_text?<p>{fi?'Paikka':'Plats'}: {session.location_text}</p>:null}<strong>{fi?'Avaa tunti ja läsnäolo':'Öppna lektion och närvaro'} →</strong></Link>) : <p>{fi?'Ei vielä ajastettuja live-tunteja.':'Inga livelektioner är schemalagda ännu.'}</p>}</div>
    </section>

    <section style={{marginTop:32}}>
      <h2>{fi ? 'Tehtävät' : 'Uppgifter'}</h2>
      <TeacherAssignmentForm classId={classId} language={access.courseLanguage} defaultLevel="A0" />
      <div style={{marginTop:22}}>
        {assignments?.length ? assignments.map((a) => {const stats=assignmentStats.get(a.id)??{submitted:0,reviewed:0};const missing=Math.max(0,ids.length-stats.submitted);const overdue=Boolean(a.due_at&&new Date(a.due_at).getTime()<Date.now());return <Link key={a.id} href={`/teacher/classes/${classId}/assignments/${a.id}`} className="teacher-dashboard-card" style={{display:'block',marginTop:12}}><h3>{a.title}</h3><p>{a.cefr_level} · {a.status==='active'?(fi?'Avoin':'Öppen'):a.status==='closed'?(fi?'Suljettu':'Stängd'):(fi?'Arkistoitu':'Arkiverad')}{a.due_at ? ` · ${overdue?(fi?'Myöhässä':'Försenad'):(fi?'Määräaika':'Deadline')} ${new Date(a.due_at).toLocaleString(fi ? 'fi-FI' : 'sv-SE')}` : ''}</p><p>{fi?`${stats.submitted}/${ids.length} palautettu · ${stats.submitted-stats.reviewed} arvioimatta · ${missing} puuttuu`:`${stats.submitted}/${ids.length} inlämnade · ${stats.submitted-stats.reviewed} obedömda · ${missing} saknas`}</p><strong>{fi ? 'Avaa palautukset' : 'Öppna inlämningar'} →</strong></Link>}) : <p>{fi ? 'Luokalle ei ole vielä tehtäviä.' : 'Klassen har ännu inga uppgifter.'}</p>}
      </div>
    </section>
  </main>
}

