import Link from 'next/link'
import { ReviewCenter } from '@/components/review/ReviewCenter'
import { createClient } from '@/lib/supabase/server'
import type { LearningLanguage } from '@/types/learning'

export const metadata = { title: 'Kertaus | OpiOpe', robots: { index: false, follow: false } }

export default async function ReviewPage() {
  let language: LearningLanguage = 'fi'
  const supabase = await createClient()
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('course_language').eq('id', user.id).maybeSingle()
      if (data?.course_language === 'sv') language = 'sv'
    }
  }
  const fi = language === 'fi'
  return <main className="review-page">
    <header className="review-page-header">
      <Link href="/student">← {fi ? 'Opiskelijan työpöytä' : 'Studentens arbetsyta'}</Link>
      <div><p className="eyebrow">OPIOPE · {fi ? 'KERTAUS' : 'REPETITION'}</p><h1>{fi ? 'Kertaa juuri se, mikä tarvitsee harjoitusta' : 'Repetera det som behöver övas'}</h1><p>{fi ? 'SRS tuo sanat takaisin oikeaan aikaan ja virhelista auttaa palaamaan vaikeisiin tehtäviin.' : 'SRS tar tillbaka orden vid rätt tidpunkt och fellistan hjälper dig tillbaka till svåra uppgifter.'}</p></div>
    </header>
    <ReviewCenter language={language}/>
  </main>
}
