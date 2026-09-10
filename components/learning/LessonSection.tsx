import type { ReactNode } from 'react'

type LessonSectionProps = { number: number; eyebrow: string; title: string; children: ReactNode; complete?: boolean }

export function LessonSection({ number, eyebrow, title, children, complete = false }: LessonSectionProps) {
  return <section className="section lesson-section" aria-labelledby={`lesson-section-${number}`}>
    <div className="section-kicker">{String(number).padStart(2, '0')} / {eyebrow}</div>
    <div className="split-heading"><h2 id={`lesson-section-${number}`}>{title}</h2>{complete && <span className="lesson-complete" role="status">Suoritettu</span>}</div>
    {children}
  </section>
}
