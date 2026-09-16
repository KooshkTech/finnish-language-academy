import type { Metadata } from 'next'
import Link from 'next/link'
import { academyBooks } from '@/data/academy-curriculum'

export const metadata: Metadata = { title: 'OpiOpe Academy — Suomi A0–C2', description: '70 alkuperäistä suomen oppituntia: 10 jokaiselle tasolle A0–C2.', alternates: { canonical: '/learn/academy' } }

export default function AcademyPage() {
  const levels = academyBooks.filter(book => book.id.startsWith('fi-'))
  const legacy = academyBooks.filter(book => !book.id.startsWith('fi-'))
  return <main className="course-page"><div className="course-page-inner">
    <header className="course-hero"><p className="eyebrow">OPIOPE V24.23 · SUOMI A0 → C2</p><h1>Suomen kielen oppimisakatemia.</h1><p>70 alkuperäistä oppituntia. Jokaisella tasolla 10 avattavaa tuntia; viimeinen tunti kertaa aiempaa sisältöä.</p><p>Tasot ovat opiskelun tavoitteita, eivät virallisia CEFR- tai YKI-arvioita. A0 tarkoittaa alkeiden aloitusvaihetta. Sisältö tarvitsee vielä opettajan pedagogisen tarkistuksen.</p></header>
    <section className="catalog-grid" aria-label="Suomen 70 oppituntia">{levels.map(book => <article className="catalog-card" key={book.id}><div className="catalog-card-top"><span className="level-chip">{book.levelRange}</span><span className="status-chip published">10 oppituntia</span></div><h2>{book.title}</h2><h3>{book.subtitle}</h3><p>{book.description}</p><Link className="primary-button catalog-link" href={`/learn/academy/${book.id}`}>Avaa tason oppitunnit →</Link></article>)}</section>
    <h2>Aiemmat moduulit ja YKI-harjoitukset</h2><p>Aiempi sisältö säilyy käytettävissä. Näissä moduuleissa osa otsikoista on vasta suunnitelmia.</p>
    <section className="catalog-grid" aria-label="Aiemmat moduulit">{legacy.map(book => <article className="catalog-card" key={book.id}><h2>{book.title}</h2><p>{book.subtitle}</p><p>{book.publishedLessonIds.length} avattavaa oppituntia · {book.lessonTitles.length} suunniteltua otsikkoa</p><Link className="outline-button" href={`/learn/academy/${book.id}`}>Avaa aiempi moduuli →</Link></article>)}</section>
  </div></main>
}
