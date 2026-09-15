import Link from 'next/link'

export default function CourseGateway() {
  return <main className="role-gateway">
    <header className="role-gateway-header">
      <div className="role-brand"><span>OO</span><strong>OpiOpe</strong></div>
      <Link href="/contacts">Yhteystiedot</Link>
    </header>

    <section className="role-gateway-hero">
      <p className="eyebrow">VALITSE OPISKELTAVA KIELI</p>
      <h1>Mitä haluat opiskella?</h1>
      <p>Valitse ensin suomi tai ruotsi. Sen jälkeen valitset roolisi ja oman tasosi A0–C2.</p>
    </section>

    <section className="role-choice-grid course-choice-grid" aria-label="Valitse opiskeltava kieli">
      <Link className="role-choice-card course-choice-card" href="/course/fi">
        <span className="role-icon" aria-hidden="true">FI</span>
        <small>01</small>
        <h2>Suomi</h2>
        <p>Suomen kielen oppimispolku tasolta A0 tasolle C2. Arki, työ, puhekieli, kielioppi, sanasto, kuuntelu ja YKI-harjoittelu.</p>
        <strong>Valitse suomi →</strong>
      </Link>
      <Link className="role-choice-card course-choice-card" href="/course/sv">
        <span className="role-icon" aria-hidden="true">SV</span>
        <small>02</small>
        <h2>Ruotsi</h2>
        <p>Ruotsin kielen oppimispolku tasolta A0 tasolle C2. Arjen viestintä, työ, kielioppi, sanasto, kuuntelu ja puhuminen.</p>
        <strong>Valitse ruotsi →</strong>
      </Link>
    </section>
  </main>
}

