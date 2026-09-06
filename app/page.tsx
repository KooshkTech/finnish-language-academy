'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Check, ChevronDown, CirclePlay, Headphones, Menu, Mic2, PenLine, Search, Sparkles, X } from 'lucide-react'

const levels = ['Kaikki', 'A0–A1', 'A2', 'B1', 'B2–C2']
const courses = [
  { level: 'A0–A1', tag: 'Alkeet', title: 'Suomi alusta asti', description: 'Turvallinen alku suomen kieleen. Opit peruslauseet, tervehdykset ja arjen tärkeimmät sanat.', lessons: 42, color: 'sun' },
  { level: 'A2', tag: 'Arki', title: 'Sujuvampi arki', description: 'Vahvista keskustelutaitoa ja ymmärrystä tilanteissa, joita kohtaat joka päivä.', lessons: 56, color: 'mint' },
  { level: 'B1', tag: 'Työelämä', title: 'Suomi työssä', description: 'Kirjoita, puhu ja ymmärrä työelämän suomea varmemmin ja omalla äänelläsi.', lessons: 38, color: 'blue' },
  { level: 'B2–C2', tag: 'YKI', title: 'Kohti YKI-testiä', description: 'Rakenna strategia testiin, harjoittele tehtävätyyppejä ja saat palautetta kirjoittamisesta.', lessons: 64, color: 'coral' },
]

const faqs = [
  ['Sopiiko Academy minulle, jos olen ihan alussa?', 'Kyllä. Aloita Suomi alusta asti -kurssilta tai tee lyhyt sijoittumistesti, joka ohjaa sinulle sopivan lähtötason.'],
  ['Miten kurssit eroavat toisistaan?', 'Kurssit on rakennettu CEFR-tasoille A0–C2. Jokainen yhdistää kuuntelua, puhumista, lukemista, kirjoittamista ja kielioppia.'],
  ['Voinko valmistautua YKI-testiin?', 'Kyllä. YKI-polku sisältää tehtävätyyppejä, mallivastauksia ja harjoittelurutiineja kaikille testin osa-alueille.'],
  ['Onko sisältö käytettävissä puhelimella?', 'On. Oppitunnit ja harjoitukset toimivat selaimessa puhelimella, tabletilla ja tietokoneella.'],
]

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState('Kaikki')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [placementOpen, setPlacementOpen] = useState(false)
  const [placementStep, setPlacementStep] = useState(0)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const filteredCourses = useMemo(() => selectedLevel === 'Kaikki' ? courses : courses.filter((course) => course.level === selectedLevel), [selectedLevel])

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="announcement">Avaa suomen kieli omalla tahdillasi <span>·</span> Ensimmäinen oppitunti aina ilmainen <ArrowRight size={14} /></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Finnish Language Academy etusivu"><span className="brand-mark">F</span><span>Finnish<br /><em>Language Academy</em></span></a>
        <nav className="desktop-nav" aria-label="Päänavigaatio"><a href="#courses">Kurssit</a><a href="#how">Näin se toimii</a><a href="#yki">YKI</a><a href="#faq">UKK</a></nav>
        <div className="header-actions"><button className="language-button" aria-label="Vaihda kieltä">FI <ChevronDown size={14} /></button><button className="text-button">Kirjaudu</button><button className="dark-button" onClick={() => setPlacementOpen(true)}>Aloita testi <ArrowRight size={15} /></button><button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Avaa valikko" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button></div>
      </header>
      {menuOpen && <nav className="mobile-nav" aria-label="Mobiilinavigaatio"><a href="#courses" onClick={() => setMenuOpen(false)}>Kurssit</a><a href="#how" onClick={() => setMenuOpen(false)}>Näin se toimii</a><a href="#yki" onClick={() => setMenuOpen(false)}>YKI</a><a href="#faq" onClick={() => setMenuOpen(false)}>UKK</a></nav>}

      <section className="hero" id="top">
        <div className="hero-copy"><p className="eyebrow">SUOMEN KIELEN KOULU · 2026</p><h1>Suomi, joka<br /><span>tuntuu omalta.</span></h1><p className="hero-lede">Opettele suomea käytännön tilanteisiin, oikeilla sanoilla ja omaan tahtiisi. Selkeä polku aloittelijasta sujuvaan puhujaan.</p><div className="hero-buttons"><button className="primary-button" onClick={() => setPlacementOpen(true)}>Määritä lähtötasosi <ArrowRight size={17} /></button><a className="play-link" href="#how"><span className="play-icon"><CirclePlay size={19} /></span> Katso miten se toimii</a></div><div className="hero-proof"><div className="avatar-stack"><span>MH</span><span>AS</span><span>LN</span><span>+</span></div><p><strong>12 000+</strong> oppijaa on<br />löytänyt oman äänensä.</p></div></div>
        <div className="hero-art" aria-label="Oppimisen polku"><div className="art-note note-one">hei! <span>01</span></div><div className="art-note note-two">minä puhun suomea <span>02</span></div><div className="art-card"><div className="card-top"><span>Kuukauden sana</span><span>03 / 26</span></div><strong>juurtua</strong><p>to put down roots<br /><i>/ juːr.tu.ɑ /</i></p><div className="card-line" /><span className="card-example">“Täällä on hyvä juurtua.”</span></div><div className="art-circle">å</div><div className="art-label">/ äänen löytäminen /</div></div>
      </section>

      <section className="logo-strip"><span>TEHTY OPPIMISEEN</span><div><strong>CEFR</strong><strong>YKI</strong><strong>OPH</strong><strong>EUROPEAN<br />LANGUAGES</strong></div></section>

      <section className="section intro-section" id="how"><div className="section-kicker">01 / METODI</div><div className="split-heading"><h2>Ei ulkoa opettelua.<br /><span>Vaan käyttöä.</span></h2><div><p className="section-lede">Kieli ei ole lista sanoja. Se on avain siihen, että voit osallistua, kysyä, kertoa ja tulla ymmärretyksi.</p><a className="arrow-link" href="#courses">Tutustu metodiin <ArrowRight size={16} /></a></div></div><div className="method-grid"><div className="method-card wide"><div className="method-icon"><Mic2 /></div><div><span>01 — PUHU</span><h3>Harjoittele oikeita tilanteita</h3><p>Rakenna lauseita, jotka tarvitset oikeassa elämässä. Pienissä paloissa, aina ääneen.</p></div><span className="method-number">01</span></div><div className="method-card"><div className="method-icon"><Headphones /></div><span>02 — KUUNTELE</span><h3>Totu suomen ääneen</h3><p>Kuuntele hidasta ja luonnollista puhetta. Korva oppii ennen kuin pää ehtii mukaan.</p><span className="method-number">02</span></div><div className="method-card accent"><div className="method-icon"><PenLine /></div><span>03 — RAKENNA</span><h3>Näe oma kehityksesi</h3><p>Edisty näkyvästi. Viikkotavoitteet tekevät harjoittelusta tavan, eivät projektia.</p><span className="method-number">03</span></div></div></section>

      <section className="section courses-section" id="courses"><div className="section-kicker">02 / OPINTOPOLUT</div><div className="section-heading-row"><div><h2>Löydä oma <span>polkusi.</span></h2><p>Selkeät kurssit. Yksi askel kerrallaan.</p></div><a className="arrow-link desktop-only" href="#pricing">Katso kaikki kurssit <ArrowRight size={16} /></a></div><div className="level-filters" role="tablist" aria-label="Suodata kursseja">{levels.map((level) => <button key={level} className={selectedLevel === level ? 'active' : ''} onClick={() => setSelectedLevel(level)} role="tab" aria-selected={selectedLevel === level}>{level}</button>)}</div><div className="course-grid">{filteredCourses.map((course) => <article className={`course-card ${course.color}`} key={course.title}><div className="course-top"><span>{course.tag}</span><span>{course.level}</span></div><div className="course-symbol">{course.color === 'sun' ? 'ä' : course.color === 'mint' ? 'ö' : course.color === 'blue' ? 'y' : 'ä'}</div><h3>{course.title}</h3><p>{course.description}</p><div className="course-bottom"><span>{course.lessons} oppituntia</span><ArrowRight size={18} /></div></article>)}</div></section>

      <section className="yki-banner" id="yki"><div><p className="eyebrow">YKI-POLKU</p><h2>Sinä pystyt siihen.<br /><em>Me autamme perille.</em></h2><p>Jäsennelty harjoittelu, joka tekee YKI-testistä tutun ennen kuin astut koesaliin.</p><button className="light-button">Tutustu YKI-polkuun <ArrowRight size={16} /></button></div><div className="yki-score"><span>YKI</span><strong>4</strong><small>HYVÄ</small><div className="score-bars"><i /><i /><i /><i /></div></div></section>

      <section className="section routine-section"><div className="section-kicker">03 / JOKA PÄIVÄ</div><div className="routine-layout"><div><h2>10 minuuttia.<br /><span>Yksi uusi sana.</span></h2><p className="section-lede">Pieni päivittäinen rutiini kertyy nopeasti taidoksi. Aloita tänään kuukauden sanasta.</p><button className="outline-button">Aloita harjoitus <ArrowRight size={16} /></button></div><div className="word-card"><div className="word-card-head"><span>KUUKAUDEN SANA</span><span>MAALISKUU</span></div><div className="word-big">juurtua</div><div className="word-pronounce">/ ˈjuːrtuɑ / <button aria-label="Kuuntele ääntäminen"><CirclePlay size={23} /></button></div><p>to put down roots · vakiintua</p><div className="word-example">“Tänne on ollut helppo juurtua.”<small>— OPPITUNTI 12</small></div></div></div></section>

      <section className="section pricing-section" id="pricing"><div className="section-kicker">04 / JATKA MATKAA</div><div className="pricing-head"><h2>Opiskele, kun<br /><span>sinulle sopii.</span></h2><p>Kaikki tarvittava yhdessä paikassa. Ei aikataulupainetta, ei piilokuluja.</p></div><div className="pricing-card"><div><span className="price-tag">ACADEMY / KUUKAUSI</span><h3>Rakenna oma<br />suomenkielesi.</h3><p>Kaikki kurssit, harjoitukset ja edistymisen seuranta.</p></div><div className="price-details"><strong>19<span>€</span></strong><small>/ kk</small><button className="primary-button">Aloita ilmaiseksi <ArrowRight size={16} /></button><small>Peruuta milloin tahansa.</small></div></div></section>

      <section className="section faq-section" id="faq"><div className="section-kicker">05 / UKK</div><div className="faq-layout"><h2>Usein kysyttyä.<br /><span>Selkeästi.</span></h2><div className="faq-list">{faqs.map(([question, answer], index) => <div className="faq-item" key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span>{question}</span><span className="faq-plus">{openFaq === index ? '−' : '+'}</span></button>{openFaq === index && <p>{answer}</p>}</div>)}</div></div></section>

      <section className="newsletter"><div><p className="eyebrow">SÄHKÖPOSTIIN, EI ROSKAA</p><h2>Yksi sana kerrallaan.</h2><p>Kuukauden sana, oppimisvinkkejä ja ripaus suomalaista arkea.</p></div>{subscribed ? <div className="subscribed"><Check size={18} /> Kiitos, olet mukana.</div> : <form onSubmit={(event) => { event.preventDefault(); if (email) setSubscribed(true) }}><label className="sr-only" htmlFor="email">Sähköpostiosoitteesi</label><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="sähköpostisi@osoite.fi" /><button type="submit" aria-label="Tilaa uutiskirje"><ArrowRight /></button></form>}</section>

      <footer className="footer"><div className="footer-top"><a className="brand" href="#top"><span className="brand-mark">F</span><span>Finnish<br /><em>Language Academy</em></span></a><p>Suomen kieli kuuluu kaikille.</p><div className="footer-links"><a href="#courses">Kurssit</a><a href="#yki">YKI</a><a href="#faq">UKK</a><a href="#top">Instagram</a></div></div><div className="footer-bottom"><span>© 2026 Finnish Language Academy</span><span>Tehty oppimiseen, Helsingissä.</span></div></footer>

      {placementOpen && <div className="modal-backdrop" role="presentation" onClick={() => setPlacementOpen(false)}><div className="placement-modal" role="dialog" aria-modal="true" aria-labelledby="placement-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setPlacementOpen(false)} aria-label="Sulje"><X size={18} /></button>{placementStep === 0 ? <><span className="modal-label">PIKAINEN SIJOITTUMISTESTI</span><h2 id="placement-title">Mistä aloitetaan?</h2><p>Vastaa kolmeen kysymykseen. Saat suosituksen sopivasta lähtötasosta.</p><div className="modal-progress"><i /><i /><i /></div><button className="primary-button full" onClick={() => setPlacementStep(1)}>Aloitetaan <ArrowRight size={16} /></button><small>Arvio vie noin 2 minuuttia.</small></> : placementStep === 1 ? <><span className="modal-label">KYSYMYS 1 / 3</span><h2 id="placement-title">Miten tervehdit ystävää?</h2><div className="answer-list"><button onClick={() => setPlacementStep(2)}>Hyvää päivää!</button><button onClick={() => setPlacementStep(2)}>Moi, mitä kuuluu?</button><button onClick={() => setPlacementStep(2)}>Good morning!</button></div><div className="modal-progress"><i className="done" /><i /><i /></div></> : <><span className="modal-label">ENSIMMÄINEN ASKEL</span><h2 id="placement-title">Aloita tasolta A0–A1</h2><p>Suosituksemme on <strong>Suomi alusta asti</strong>. Voit aina vaihtaa tasoa myöhemmin.</p><button className="primary-button full" onClick={() => setPlacementOpen(false)}>Tutustu kurssiin <ArrowRight size={16} /></button><div className="modal-progress"><i className="done" /><i className="done" /><i className="done" /></div></>}</div></div>}
    </main>
  )
}
