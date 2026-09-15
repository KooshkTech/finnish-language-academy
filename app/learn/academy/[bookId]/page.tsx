import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAcademyBook } from '@/data/academy-curriculum'
import { getPublishedAcademyLessons } from '@/data/academy-lessons'

export async function generateMetadata({params}:{params:Promise<{bookId:string}>}):Promise<Metadata>{const {bookId}=await params;const book=getAcademyBook(bookId);if(!book)return{};return{title:`${book.title} — ${book.levelRange}`,description:book.description,alternates:{canonical:`/learn/academy/${book.id}`}}}
export default async function BookPage({params}:{params:Promise<{bookId:string}>}){const {bookId}=await params;const book=getAcademyBook(bookId);if(!book)notFound();const published=getPublishedAcademyLessons(bookId);return <main className="course-page"><div className="course-page-inner"><Link className="back-link" href="/learn/academy">← Akatemia</Link><header className="course-hero"><p className="eyebrow">{book.levelRange}</p><h1>{book.title}</h1><p>{book.description}</p></header><section className="lesson-stage-card"><h2>20 oppitunnin opetussuunnitelma</h2><p>Oppijoille avataan vain täysin tarkistetut oppitunnit. Julkaisemattomat otsikot näkyvät pitkän aikavälin opetussuunnitelmana, eivät valmiina sisältönä.</p><div className="engine-exercises">{book.lessonTitles.map((title,index)=>{const lesson=published.find(item=>item.number===index+1);return <article key={title} className="engine-exercise"><p className="modal-label">OPPITUNTI {String(index+1).padStart(2,'0')}</p><h3>{title}</h3>{lesson?<Link className="primary-button" href={`/learn/academy/${book.id}/${lesson.id}`}>Aloita oppitunti →</Link>:<span className="status-chip">Opetussuunnitelma · ei vielä julkaistu</span>}</article>})}</div></section></div></main>}

