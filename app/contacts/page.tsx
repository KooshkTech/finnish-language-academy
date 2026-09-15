import Link from 'next/link'
import { BookOpen, CircleHelp, GraduationCap, Mail, MessageCircle, ShieldCheck } from 'lucide-react'

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@opiope.fi'
const privacyEmail = process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? 'privacy@opiope.fi'

export default function ContactsPage() {
  return <main className="contacts-page">
    <header className="contacts-header"><Link href="/">← OpiOpe</Link><p className="eyebrow">CONTACTS · YHTEYSTIEDOT</p><h1>Miten voimme auttaa?</h1><p>Valitse aihe. OpiOpe ei näytä tekaistua live-chatia: yhteydenotto avaa sähköpostin, kunnes erillinen tukijärjestelmä on kytketty.</p></header>
    <section className="contact-grid">
      <a href={`mailto:${supportEmail}?subject=OpiOpe%20oppimistuki`}><BookOpen/><strong>Oppiminen ja kurssit</strong><span>Oppitunnit, tasot, Blackboard, harjoitukset ja testit.</span><small>{supportEmail}</small></a>
      <a href={`mailto:${supportEmail}?subject=OpiOpe%20tekninen%20tuki`}><CircleHelp/><strong>Tekninen tuki</strong><span>Kirjautuminen, sivut, ääni, tiedostot ja tekniset ongelmat.</span><small>{supportEmail}</small></a>
      <a href={`mailto:${supportEmail}?subject=OpiOpe%20opettaja`}><GraduationCap/><strong>Opettajat</strong><span>Opettajan asetukset, ryhmät ja opetuskäyttö.</span><small>{supportEmail}</small></a>
      <a href={`mailto:${privacyEmail}?subject=OpiOpe%20tietosuoja`}><ShieldCheck/><strong>Tietosuoja</strong><span>Henkilötiedot, vienti, poisto ja yksityisyyskysymykset.</span><small>{privacyEmail}</small></a>
    </section>
    <details className="contact-more" open><summary><MessageCircle/> Mitä viestiin kannattaa kirjoittaa?</summary><div><p>1. Kerro oma tasosi (esim. A1).</p><p>2. Kerro sivu tai toiminto, jossa ongelma näkyy.</p><p>3. Kuvaa mitä tapahtui ja mitä odotit tapahtuvan.</p><p>4. Älä lähetä salasanoja tai arkaluonteisia henkilötietoja.</p></div></details>
    <div className="contact-direct"><Mail/><span>Yleinen tuki</span><a href={`mailto:${supportEmail}`}>{supportEmail}</a></div>
  </main>
}

