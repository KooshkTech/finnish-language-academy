import type { Metadata } from 'next'
import Link from 'next/link'
import { learningLevels } from '@/data/levels'
import { getPublishedCourses } from '@/data/course-catalog'
import { DailyLessonFeed } from '@/components/DailyLessonFeed'

export const metadata: Metadata = {
  title: 'Suomen ja ruotsin kielitasot A0–C2',
  description: 'Valitse oma kielitasosi A0, A1, A2, B1, B2, C1 tai C2 ja siirry suoraan juuri sen tason kuuntelu-, luku-, kirjoitus-, kielioppi-, sanasto-, puhe- ja YKI-harjoitteluun.',
  alternates: { canonical: '/learn' },
}

export default function HomePage() {
  const publishedCourses = getPublishedCourses()
  return <main className="simple-home">
    <header className="simple-home-header">
      <Link href="/" className="simple-brand"><span>OO</span><strong>OpiOpe</strong></Link>
      <nav aria-label="Päävalikko">
        <a href="#levels">Tasot</a>
        <Link href="/dictionary">Sanakirja</Link>
        <Link href="/schedule">Viikko-ohjelma</Link>
        <Link href="/yki-test">YKI</Link>
        <Link href="/contacts">Yhteystiedot</Link>
        <Link href="/join-class">Liity luokkaan</Link>
        <Link href="/teacher/settings">Asetukset</Link>
      </nav>
    </header>

    <section className="level-first-hero">
      <div className="level-hero-copy">
        <p className="eyebrow">OPIOPE ACADEMY · A0 → C2 + YKI</p>
        <h1>Opi suomea.<br/><span>Kirja kerrallaan.</span></h1>
        <p>OPIOPE yhdistää lukemisen, kuuntelun, kieliopin, harjoitukset, puhumisen ja oppimistestin samaan selkeään oppituntiin. Aloita tasolta A0 tai valitse oma tasosi. Jokaisella tasolla on 10 suomen oppituntia.</p>
        <div className="hero-cta-row"><Link className="primary-level-cta" href="/learn/academy">Avaa OPIOPE Academy →</Link><a className="secondary-level-cta" href="#levels">Valitse taso ↓</a></div>
      </div>
      <div className="hero-board-preview" aria-label="Oppimisen rakenne">
        <div className="board-top"><span>OPIOPE HARJOITUSTAULU</span><span>SELKEÄ POLKU</span></div>
        <h2>1 taso.<br/>7 tärkeää taitoa.</h2>
        <div className="hero-board-list"><span>Kuuntelu</span><span>Lukeminen</span><span>Kirjoittaminen</span><span>Ymmärtäminen</span><span>Sanasto</span><span>Puhuminen</span><span>YKI-testi</span></div>
        <p>Jokaisella sivulla: oppitunti → harjoitus → harjoitustaulu → testi.</p>
      </div>
    </section>

    <DailyLessonFeed />

    <section className="continue-learning-section" aria-label="OPIOPE Academy">
      <div className="levels-heading"><div><p className="eyebrow">UUSI · OPIOPE ACADEMY</p><h2>A0 → C2 + YKI · selkeät oppimiskirjat.</h2></div><p>Kuusiosaiset oppitunnit: lukeminen, kuuntelu, kielioppi, harjoittelu, puhuminen ja osaamistesti.</p></div>
      <Link className="primary-button catalog-link" href="/learn/academy">Avaa OPIOPE Academy →</Link>
    </section>

    <section className="continue-learning-section" aria-label="Jatka oppimista">
      <div className="levels-heading"><div><p className="eyebrow">JATKA OPPIMISTA</p><h2>Aloita oikeasta kurssista.</h2></div><p>A0–B1 sisältävät nyt kymmeniä oikeita oppitunteja. Valitse taso ja etene moduuli kerrallaan.</p></div>
      <div className="catalog-grid compact-course-grid">
        {publishedCourses.map(course => {
          const lessonCount = course.modules.flatMap(courseModule => courseModule.units).flatMap(unit => unit.lessons).length
          return <article className="catalog-card" key={course.id}>
            <div className="catalog-card-top"><span className="level-chip">{course.level}</span><span className="status-chip published">{lessonCount} oppituntia</span></div>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <Link className="primary-button catalog-link" href={`/courses/${course.id}`}>Jatka oppimista →</Link>
          </article>
        })}
      </div>
    </section>

    <section className="levels-section" id="levels">
      <div className="levels-heading"><div><p className="eyebrow">A0 → C2 · 0 → 100</p><h2>Mikä on sinun tasosi?</h2></div><p>Napauta tasoa. Se avaa sen tason oman pääsivun ja oman opiskelumenun.</p></div>
      <div className="level-card-grid">
        {learningLevels.map((level,index) => <Link key={level.id} href={`/levels/${level.id}`} className="level-home-card">
          <div className="level-card-top"><span>{String(index+1).padStart(2,'0')}</span><small>{level.range}/100</small></div>
          <strong className="level-big-label">{level.label}</strong>
          <h3>{level.title}</h3>
          <p>{level.description}</p>
          <div className="level-card-action">Avaa {level.label} <b>→</b></div>
        </Link>)}
      </div>
      <div className="level-help"><strong>Etkö tiedä tasoasi?</strong><p>Aloita A0:sta tai tee myöhemmin tasotesti. Tason voi vaihtaa milloin tahansa.</p></div>
    </section>

    <section className="simple-flow-section">
      <p className="eyebrow">MITÄ TASON SISÄLLÄ ON?</p>
      <h2>Sama selkeä rakenne jokaisella tasolla.</h2>
      <div className="simple-flow-grid">
        {['Kuuntelu','Lukeminen','Kirjoittaminen','Ymmärtäminen','Sanasto','Puhuminen','YKI-testi'].map((item,index)=><div key={item}><span>{index+1}</span><strong>{item}</strong><small>Oppitunti + harjoitustaulu + harjoitus + testi</small></div>)}
      </div>
    </section>
  </main>
}
