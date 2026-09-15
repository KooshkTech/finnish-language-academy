import type { Metadata } from 'next'
import Link from 'next/link'
import { academyBooks } from '@/data/academy-curriculum'

export const metadata: Metadata = { title:'OPIOPE Academy — Finnish A0 to C2 + YKI', description:'Structured OPIOPE Finnish curriculum from A0 to C2 with reading, listening, grammar, practice, speaking and mastery testing.', alternates:{canonical:'/learn/academy'} }
export default function AcademyPage(){return <main className="course-page"><div className="course-page-inner"><header className="course-hero"><p className="eyebrow">OPIOPE · A0 → C2 + YKI</p><h1>Suomen kielen oppimisakatemia.</h1><p>Opi → ymmärrä → harjoittele → puhu → testaa → kertaa → hallitse → edisty.</p></header><div className="catalog-grid">{academyBooks.map(book=><article className="catalog-card" key={book.id}><div className="catalog-card-top"><span className="level-chip">{book.levelRange}</span><span className="status-chip published">{book.lessonTitles.length} oppituntia</span></div><h2>{book.title}</h2><h3>{book.subtitle}</h3><p>{book.description}</p><p><strong>Julkaistu nyt:</strong> {book.publishedLessonIds.length} täysin rakennettua esimerkkituntia.</p><Link className="primary-button catalog-link" href={`/learn/academy/${book.id}`}>Avaa opetussuunnitelma →</Link></article>)}</div></div></main>}

