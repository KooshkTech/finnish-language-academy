import type { Metadata } from 'next'
import CourseGateway, { homeFaqs } from '@/components/auth/CourseGateway'
import { siteOrigin } from '@/lib/seo.mjs'

export const metadata: Metadata = {
  title: { absolute: 'Opi suomea tai ruotsia ilmaiseksi A0–C2 | OpiOpe' },
  description: 'Aloita suomen tai ruotsin verkkokurssi ilmaiseksi. Selkeät A0–C2-oppitunnit arkeen, työhön, opiskeluun ja YKI-kokeeseen kaikilla laitteilla.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Opi suomea tai ruotsia ilmaiseksi A0–C2',
    description: 'Selkeä kielikurssi arkeen, työhön, opiskeluun ja YKI-kokeeseen. Aloita ilman tiliä.',
    url: '/',
    locale: 'fi_FI',
    type: 'website',
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'OpiOpe',
      url: siteOrigin(),
      inLanguage: ['fi', 'sv'],
      description: 'Ilmainen suomen ja ruotsin oppimisalusta tasoille A0–C2.',
    },
    {
      '@type': 'FAQPage',
      mainEntity: homeFaqs.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ],
}

export default function HomePage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c') }} />
    <CourseGateway />
  </>
}
