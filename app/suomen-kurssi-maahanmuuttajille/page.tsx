import type { Metadata } from 'next'
import Link from 'next/link'
import { siteOrigin } from '@/lib/seo.mjs'

export const metadata: Metadata = {
  title: 'Suomen kielen kurssi maahanmuuttajille',
  description: 'Ilmainen suomen verkkokurssi maahanmuuttajille, pakolaisille ja uusille oppijoille. Aloita A0-tasosta ja harjoittele arjen, työn ja YKI-kokeen suomea.',
  alternates: { canonical: '/suomen-kurssi-maahanmuuttajille' },
  openGraph: {
    title: 'Suomen kielen kurssi maahanmuuttajille | OpiOpe',
    description: 'Aloita käytännön suomen opiskelu ilmaiseksi A0-tasosta. Ei aiempaa kielitaitoa eikä maksukorttia.',
    url: '/suomen-kurssi-maahanmuuttajille',
    locale: 'fi_FI',
    type: 'website',
  },
}

const faqs = [
  ['Onko kurssi ilmainen?', 'Voit aloittaa oppitunnit ilman tiliä ja maksukorttia. Ilmainen tili mahdollistaa edistymisen tallentamisen.'],
  ['Tarvitsenko aiempaa suomen taitoa?', 'Et tarvitse. A0-taso alkaa kirjaimista, äänteistä, tervehdyksistä ja ensimmäisistä arjen sanoista.'],
  ['Auttaako kurssi työssä ja viranomaisasioinnissa?', 'Kurssissa harjoitellaan käytännön sanastoa ja tilanteita arkeen, työhön, opiskeluun, palveluihin ja asiointiin.'],
  ['Voinko valmistautua YKI-kokeeseen?', 'Kyllä. Oppimispolku sisältää YKI-harjoittelua, ja voit edetä perusteista kohti kokeessa tarvittavia taitoja.'],
] as const

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Course',
      name: 'Suomen kielen verkkokurssi maahanmuuttajille',
      description: 'Ilmainen A0–C2-oppimispolku käytännön suomeen, työhön, opiskeluun ja YKI-kokeeseen.',
      url: `${siteOrigin()}/suomen-kurssi-maahanmuuttajille`,
      inLanguage: 'fi',
      educationalLevel: 'A0–C2',
      isAccessibleForFree: true,
      provider: { '@type': 'Organization', name: 'OpiOpe', url: siteOrigin() },
      audience: { '@type': 'Audience', audienceType: 'Maahanmuuttajat, pakolaiset ja muut suomen kielen oppijat' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'OpiOpe', item: siteOrigin() },
        { '@type': 'ListItem', position: 2, name: 'Suomen kurssi maahanmuuttajille', item: `${siteOrigin()}/suomen-kurssi-maahanmuuttajille` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
    },
  ],
}

const topics = [
  ['Arjen suomi', 'Kauppa, koti, liikenne, ajanvaraus ja tavalliset keskustelut.'],
  ['Työ ja opiskelu', 'Työpaikan viestit, ohjeet, hakeminen ja opiskelutilanteet.'],
  ['Palvelut ja asiointi', 'Selkeä kieli viranomaisissa, terveyspalveluissa ja muissa palvelutilanteissa.'],
  ['YKI ja tavoitteet', 'Kuuntelu, puhuminen, lukeminen ja kirjoittaminen kohti omaa tavoitettasi.'],
] as const

export default function FinnishForNewcomersPage() {
  return <main className="newcomer-page" id="main-content">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    <header className="newcomer-header">
      <Link className="role-brand" href="/" aria-label="OpiOpe etusivu"><span>OO</span><strong>OpiOpe</strong></Link>
      <Link href="/">← Takaisin etusivulle</Link>
    </header>

    <section className="newcomer-hero">
      <div>
        <p className="eyebrow">SUOMEN KIELEN VERKKOKURSSI · A0–C2</p>
        <h1>Suomea uuteen arkeen.<br/><span>Rauhallisesti ja käytännössä.</span></h1>
        <p>Ilmainen suomen kielen kurssi maahanmuuttajille, pakolaisille ja kaikille uusille oppijoille. Aloita aivan alusta tai valitse oma tasosi.</p>
        <div className="launch-actions">
          <Link className="launch-primary" href="/course/fi/levels/a0">Aloita A0-tasosta →</Link>
          <Link className="launch-secondary" href="/course/fi/levels">Näytä kaikki tasot</Link>
        </div>
        <p className="launch-language-help" lang="en">New to Finland? Begin at A0. You can study on your phone without creating an account.</p>
      </div>
      <aside className="newcomer-promise" aria-label="Kurssin hyödyt">
        <strong>Sinä saat:</strong>
        <ul><li>selkeän etenemisjärjestyksen</li><li>lyhyitä käytännön harjoituksia</li><li>70 oppituntia tasoilla A0–C2</li><li>harjoittelua puhelimella tai tietokoneella</li></ul>
      </aside>
    </section>

    <section className="newcomer-section" aria-labelledby="topics-title">
      <div className="launch-section-heading"><p className="eyebrow">MITÄ OPIT?</p><h2 id="topics-title">Kieltä, jota tarvitset Suomessa.</h2></div>
      <div className="newcomer-topic-grid">{topics.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>

    <section className="newcomer-section newcomer-start" aria-labelledby="quick-title">
      <div><p className="eyebrow">10 MINUUTIN ALOITUS</p><h2 id="quick-title">Ensimmäinen oppitunti on vain kolmen painalluksen päässä.</h2></div>
      <ol><li><span>1</span><p><strong>Avaa A0.</strong><br/>Valitse aivan ensimmäinen oppitunti.</p></li><li><span>2</span><p><strong>Kuuntele ja lue.</strong><br/>Tee harjoitus omaan tahtiin.</p></li><li><span>3</span><p><strong>Jatka huomenna.</strong><br/>Lyhyt päivittäinen harjoittelu rakentaa varmuutta.</p></li></ol>
      <Link className="launch-primary" href="/course/fi/levels/a0">Aloita nyt →</Link>
    </section>

    <section className="newcomer-section launch-faq" aria-labelledby="newcomer-faq-title">
      <div className="launch-section-heading"><p className="eyebrow">USEIN KYSYTTYÄ</p><h2 id="newcomer-faq-title">Hyvä tietää ennen aloitusta.</h2></div>
      <div className="launch-faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
    </section>

    <section className="newcomer-final">
      <p className="eyebrow">VALMIS ALOITTAMAAN?</p>
      <h2>Ensimmäinen askel on helppo.</h2>
      <p>Avaa A0 ja tee yksi oppitunti. Voit luoda ilmaisen tilin myöhemmin, jos haluat tallentaa edistymisesi.</p>
      <div className="launch-actions"><Link className="launch-primary light" href="/course/fi/levels/a0">Aloita A0 →</Link><Link className="launch-text-link light" href="/register/free?course=fi">Luo ilmainen tili</Link></div>
    </section>
  </main>
}
