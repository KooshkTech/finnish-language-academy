import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAcademyBook } from '@/data/academy-curriculum'
import { getPublishedAcademyLessons } from '@/data/academy-lessons'

export async function generateMetadata({ params }: { params: Promise<{ bookId: string }> }): Promise<Metadata> {
  const { bookId } = await params
  const book = getAcademyBook(bookId)
  return book ? { title: `${book.title} — Suomen oppitunnit`, description: book.description, alternates: { canonical: `/learn/academy/${book.id}` }, ...(!bookId.startsWith('fi-') ? { robots: { index: false, follow: true } } : {}) } : {}
}

export default async function BookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params
  const book = getAcademyBook(bookId)
  if (!book) notFound()
  const published = getPublishedAcademyLessons(bookId)
  const modernLevel = ({'opiope-1':'a0','opiope-2':'a1','opiope-3':'a2','opiope-4':'b1','opiope-5':'b2','opiope-6':'c1','opiope-yki':'b1'} as Record<string,string>)[bookId]
  return <main className="course-page"><div className="course-page-inner"><Link className="back-link" href="/learn/academy">← Akatemia</Link>
    <header className="course-hero"><p className="eyebrow">{book.levelRange}</p><h1>{book.title}</h1><p>{book.description}</p></header>
    {modernLevel && <section className="lesson-stage-card"><h2>Tämä on aiempi moduuli, jossa on myös suunniteltuja otsikoita.</h2><p>Uudessa suomen polussa jokaisella tasolla A0–C2 on 10 avattavaa oppituntia.</p><Link className="primary-button" href={`/learn/academy/fi-${modernLevel}`}>Avaa tason {modernLevel.toUpperCase()} kaikki 10 oppituntia →</Link></section>}
    <section className="lesson-stage-card"><h2>{book.lessonTitles.length} oppitunnin opetussuunnitelma</h2><p>{published.length} avattavaa oppituntia. Julkaisematon otsikko on suunnitelma, ei valmis tunti. Koneääni ei vastaa tallennettua luonnollista puhetta; avoimet tehtävät arvioidaan itse tai opettajan kanssa.</p>
      <div className="engine-exercises">{book.lessonTitles.map((title, index) => {
        const lesson = published.find(item => item.number === index + 1)
        return <article key={title} className="engine-exercise"><p className="modal-label">OPPITUNTI {String(index + 1).padStart(2, '0')}</p><h3>{title}</h3>{lesson ? <><p>{lesson.estimatedMinutes} min · {lesson.objectives[0]}</p><Link className="primary-button" href={`/learn/academy/${book.id}/${lesson.id}`}>Aloita oppitunti →</Link></> : <span className="status-chip">Opetussuunnitelma · ei vielä julkaistu</span>}</article>
      })}</div>
    </section>
  </div></main>
}
