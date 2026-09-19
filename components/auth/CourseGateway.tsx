import Link from 'next/link'

export const homeFaqs = [
  {
    question: 'Voinko aloittaa ilman tiliä?',
    answer: 'Kyllä. Voit avata suomen tai ruotsin tasot heti ilman kirjautumista. Ilmainen tili tarvitaan vain, jos haluat tallentaa edistymisesi.',
  },
  {
    question: 'Mistä tasosta aloitan?',
    answer: 'Aloita A0-tasosta, jos suomi tai ruotsi on sinulle uusi kieli. Jos osaat jo perusteet, voit valita suoraan tason A1–C2 tai tehdä tasotestin.',
  },
  {
    question: 'Sopiiko suomen kurssi maahanmuuttajille ja pakolaisille?',
    answer: 'Kyllä. Suomen kurssi harjoittelee käytännön kieltä arkeen, työhön, opiskeluun, asiointiin ja YKI-kokeeseen. A0-taso ei vaadi aiempaa suomen osaamista.',
  },
  {
    question: 'Toimiiko OpiOpe puhelimella?',
    answer: 'Kyllä. Oppitunnit ja harjoitukset on suunniteltu toimimaan puhelimella, tabletilla ja tietokoneella.',
  },
] as const

const startSteps = [
  ['1', 'Valitse kieli', 'Aloita suomesta tai ruotsista.'],
  ['2', 'Valitse taso', 'Uusi oppija aloittaa A0:sta.'],
  ['3', 'Tee yksi oppitunti', 'Harjoittele 10–15 minuuttia kerrallaan.'],
] as const

export default function CourseGateway() {
  return <main className="role-gateway launch-home" id="main-content">
    <a className="skip-link" href="#language-choice">Siirry kurssivalintaan</a>

    <header className="role-gateway-header launch-header">
      <Link className="role-brand" href="/" aria-label="OpiOpe etusivu"><span>OO</span><strong>OpiOpe</strong></Link>
      <nav className="launch-nav" aria-label="Päävalikko">
        <a href="#start">Näin aloitat</a>
        <Link href="/suomen-kurssi-maahanmuuttajille">Suomea Suomessa</Link>
        <a href="#questions">Usein kysyttyä</a>
        <Link href="/contacts">Yhteystiedot</Link>
      </nav>
    </header>

    <section className="role-gateway-hero launch-hero" aria-labelledby="launch-title">
      <div>
        <p className="eyebrow">ILMAINEN KIELTEN OPPIMISALUSTA · A0–C2</p>
        <h1 id="launch-title">Opi suomea Suomessa.<br/><span>Aloita heti.</span></h1>
        <p>Selkeä oppimispolku arkeen, työhön, opiskeluun ja YKI-kokeeseen. Aloita ilman tiliä ja opiskele omassa tahdissasi kaikilla laitteilla.</p>
        <div className="launch-actions">
          <Link className="launch-primary" href="/course/fi/levels">Aloita suomi ilmaiseksi →</Link>
          <Link className="launch-secondary" href="/placement-test">En tiedä tasoani</Link>
        </div>
        <p className="launch-language-help" lang="en">New in Finland? Start with Finnish level A0. No previous Finnish is needed.</p>
      </div>
      <aside className="launch-summary" aria-label="OpiOpe lyhyesti">
        <p className="launch-summary-label">OPIOPE LYHYESTI</p>
        <strong>70</strong><span>suomen oppituntia</span>
        <ul>
          <li>A0–C2-tasot</li>
          <li>7 tärkeää kielitaitoa</li>
          <li>Puhelin, tabletti ja tietokone</li>
          <li>Ei maksukorttia</li>
        </ul>
      </aside>
    </section>

    <section className="launch-section" id="language-choice" aria-labelledby="language-title">
      <div className="launch-section-heading">
        <p className="eyebrow">VALITSE OPISKELTAVA KIELI</p>
        <h2 id="language-title">Yksi valinta, sitten opit.</h2>
        <p>Avaa tasot heti tai siirry kirjautumiseen, jos haluat tallentaa edistymisesi.</p>
      </div>
      <div className="launch-language-grid">
        <article className="launch-language-card is-featured">
          <div className="launch-card-top"><span className="role-icon" aria-hidden="true">FI</span><small>SUOSITUIN</small></div>
          <h3>Suomen kurssi</h3>
          <p>A0–C2-polku arjen suomeen, työelämään, puhekieleen, kielioppiin, sanastoon, kuunteluun ja YKI-harjoitteluun.</p>
          <div className="launch-card-actions">
            <Link className="launch-primary" href="/course/fi/levels">Aloita ilman tiliä →</Link>
            <Link className="launch-text-link" href="/course/fi">Kirjaudu tai luo tili</Link>
          </div>
        </article>
        <article className="launch-language-card">
          <div className="launch-card-top"><span className="role-icon" aria-hidden="true">SV</span><small>RUOTSI</small></div>
          <h3>Ruotsin kurssi</h3>
          <p>A0–C2-polku arjen viestintään, työhön, kielioppiin, sanastoon, kuunteluun ja puhumiseen.</p>
          <div className="launch-card-actions">
            <Link className="launch-primary" href="/course/sv/levels">Aloita ilman tiliä →</Link>
            <Link className="launch-text-link" href="/course/sv">Kirjaudu tai luo tili</Link>
          </div>
        </article>
      </div>
    </section>

    <section className="launch-section launch-steps" id="start" aria-labelledby="start-title">
      <div className="launch-section-heading">
        <p className="eyebrow">NOPEA ALOITUS</p>
        <h2 id="start-title">Aloita kolmessa vaiheessa.</h2>
      </div>
      <ol>
        {startSteps.map(([number, title, body]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}
      </ol>
    </section>

    <section className="launch-section newcomer-callout" aria-labelledby="newcomer-title">
      <div>
        <p className="eyebrow">SUOMEA UUTEEN ARKEEN</p>
        <h2 id="newcomer-title">Suomen kurssi maahanmuuttajille, pakolaisille ja muille oppijoille.</h2>
      </div>
      <div>
        <p>Harjoittele kieltä, jota tarvitset kaupassa, liikenteessä, työssä, opiskelussa, terveyspalveluissa ja viranomaisasioinnissa. Aloita A0:sta ilman aiempaa suomen taitoa.</p>
        <Link className="launch-primary light" href="/suomen-kurssi-maahanmuuttajille">Tutustu suomen polkuun →</Link>
      </div>
    </section>

    <section className="launch-section launch-faq" id="questions" aria-labelledby="faq-title">
      <div className="launch-section-heading">
        <p className="eyebrow">APUA ALOITTAMISEEN</p>
        <h2 id="faq-title">Usein kysyttyä.</h2>
      </div>
      <div className="launch-faq-list">
        {homeFaqs.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
      </div>
    </section>

    <footer className="launch-footer">
      <Link className="role-brand" href="/"><span>OO</span><strong>OpiOpe</strong></Link>
      <p>Opi käytännön suomea ja ruotsia selkeällä A0–C2-polulla.</p>
      <nav aria-label="Alatunniste">
        <Link href="/privacy">Tietosuoja</Link>
        <Link href="/terms">Käyttöehdot</Link>
        <Link href="/cookies">Evästeet</Link>
        <Link href="/contacts">Yhteystiedot</Link>
      </nav>
    </footer>
  </main>
}
