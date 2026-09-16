import Link from 'next/link'

export const metadata = { title: 'Integritet och kakor', description: 'Information om OpiOpes lagring och samtycke.' }

export default function SwedishPrivacyPage() {
  return <main className="course-page" lang="sv"><div className="course-page-inner"><Link className="back-link" href="/course/sv">← Svenska</Link><header className="course-hero"><h1>Integritet och kakor</h1></header><section className="lesson-stage-card"><p>Nödvändig lokal lagring används för tjänstens funktioner och ditt val av samtycke. Analys aktiveras endast efter att du har godkänt den.</p><p>Den fullständiga informationen om personuppgifter finns för närvarande på finska. En fullständig svensk version måste färdigställas före offentlig lansering.</p><Link href="/privacy">Fullständig information på finska →</Link></section></div></main>
}
