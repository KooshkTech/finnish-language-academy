import { BookOpenCheck, Clock3, Target } from 'lucide-react'

type ReviewSummaryProps = { dueVocabulary: number; weakTopics: string[]; completedLessons: number; onReview?: () => void }

export function ReviewSummary({ dueVocabulary, weakTopics, completedLessons, onReview }: ReviewSummaryProps) {
  const total = dueVocabulary + weakTopics.length
  return <section className="dashboard-grid" aria-labelledby="review-heading">
    <article className="today-card"><p className="modal-label">SMART REVIEW</p><h2 id="review-heading">{total ? `${total} asiaa odottaa kertausta.` : 'Olet ajan tasalla.'}</h2><p>OPIOPE nostaa ensin sanat ja rakenteet, joissa tarvitset eniten varmuutta.</p><button className="dark-button" onClick={onReview} disabled={!total}>Aloita kertaus</button></article>
    <article className="progress-card"><div className="review-metric"><BookOpenCheck size={18} /><strong>{completedLessons}</strong><span>oppituntia suoritettu</span></div><div className="review-metric"><Target size={18} /><strong>{dueVocabulary}</strong><span>sanaa tänään</span></div><div className="review-metric"><Clock3 size={18} /><strong>{weakTopics.length}</strong><span>rakennetta harjoiteltavana</span></div></article>
  </section>
}
