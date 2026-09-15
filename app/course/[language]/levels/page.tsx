import Link from 'next/link'
import { notFound } from 'next/navigation'

const levels = ['A0','A1','A2','B1','B2','C1','C2'] as const

type Props = { params: Promise<{ language: string }> }

export default async function CourseLevelsPage({ params }: Props) {
  const { language } = await params
  if (language !== 'fi' && language !== 'sv') notFound()
  const fi = language === 'fi'
  return <main className="course-page"><div className="course-page-inner">
    <Link className="back-link" href={`/course/${language}`}>{fi ? '← Takaisin käyttäjävalintaan' : '← Tillbaka till användarval'}</Link>
    <header className="course-hero"><p className="eyebrow">{fi ? 'SUOMEN KURSSI' : 'SVENSKAKURS'}</p><h1>{fi ? 'Valitse tasosi A0–C2' : 'Välj din nivå A0–C2'}</h1><p>{fi ? 'Aloita omalta tasoltasi tai etene alusta järjestyksessä.' : 'Börja på din nivå eller gå vidare från början i ordning.'}</p></header>
    <section className="catalog-grid">{levels.map(level => <Link key={level} className="catalog-card" href={`/course/${language}/levels/${level.toLowerCase()}`}><small>{fi ? 'TASO' : 'NIVÅ'}</small><h2>{level}</h2><p>{fi ? 'Avaa tämän tason oppimissisällöt ja taidot.' : 'Öppna nivåns lärinnehåll och färdigheter.'}</p></Link>)}</section>
  </div></main>
}

