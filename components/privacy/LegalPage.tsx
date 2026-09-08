import Link from 'next/link'
import type { ReactNode } from 'react'

export function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="legal-page">
      <div className="legal-wrap">
        <Link className="back-link" href="/">← OpiOpe</Link>
        <span className="modal-label">YKSITYISYYS JA EHDOT</span>
        <h1>{title}</h1>
        <p className="legal-lead">{intro}</p>
        <div className="legal-content">{children}</div>
        <nav className="legal-nav" aria-label="Lakiasiat">
          <Link href="/privacy">Tietosuojaseloste</Link>
          <Link href="/cookies">Evästeet</Link>
          <Link href="/terms">Käyttöehdot</Link>
          <Link href="/account/privacy">Omat tiedot</Link>
        </nav>
      </div>
    </main>
  )
}
