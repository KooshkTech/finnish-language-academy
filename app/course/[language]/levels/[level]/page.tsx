import Link from 'next/link'
import { notFound } from 'next/navigation'

const allowed = new Set(['a0','a1','a2','b1','b2','c1','c2'])
type Props = { params: Promise<{ language: string; level: string }> }

const skills = [
  { slug: 'listening', fi: 'Kuuntelu', sv: 'Lyssna' },
  { slug: 'reading', fi: 'Lukeminen', sv: 'Läsa' },
  { slug: 'writing', fi: 'Kirjoittaminen', sv: 'Skriva' },
  { slug: 'speaking', fi: 'Puhuminen', sv: 'Tala' },
  { slug: 'understanding', fi: 'Kielioppi', sv: 'Grammatik' },
  { slug: 'vocabulary', fi: 'Sanasto', sv: 'Ordförråd' },
] as const

export default async function CourseLevelPage({ params }: Props) {
  const { language, level } = await params
  if ((language !== 'fi' && language !== 'sv') || !allowed.has(level)) notFound()
  const fi = language === 'fi'
  const label = level.toUpperCase()

  return <main className="course-page"><div className="course-page-inner">
    <Link className="back-link" href={`/course/${language}/levels`}>{fi ? '← Kaikki tasot' : '← Alla nivåer'}</Link>
    <header className="course-hero">
      <p className="eyebrow">{fi ? 'SUOMI' : 'SVENSKA'} · {label}</p>
      <h1>{fi ? `Taso ${label}` : `Nivå ${label}`}</h1>
      <p>{fi ? 'Kuuntelu, lukeminen, kirjoittaminen, puhuminen, kielioppi ja sanasto kuuluvat samaan oppimispolkuun.' : 'Lyssna, läsa, skriva, tala, grammatik och ordförråd ingår i samma lärstig.'}</p>
    </header>
    <section className="catalog-grid" aria-label={fi ? `Tason ${label} taidot` : `Färdigheter för nivå ${label}`}>
      {skills.map(skill => (
        <Link
          key={skill.slug}
          className="catalog-card catalog-card-link"
          href={`/course/${language}/levels/${level}/${skill.slug}`}
        >
          <div className="catalog-card-top">
            <h2>{fi ? skill.fi : skill.sv}</h2>
            <span className="catalog-card-arrow" aria-hidden="true">→</span>
          </div>
          <p>{fi ? 'Avaa oppitunti, harjoitukset ja tämän taidon tehtävät.' : 'Öppna lektionen, övningarna och uppgifterna för den här färdigheten.'}</p>
        </Link>
      ))}
    </section>
  </div></main>
}

