import type { Metadata } from 'next'
import CourseGateway from '@/components/auth/CourseGateway'
import { siteOrigin } from '@/lib/seo.mjs'

export const metadata: Metadata = {
  title: 'OpiOpe – Opi suomea tai ruotsia A0–C2',
  description: 'Valitse suomen tai ruotsin kurssi ja etene tasolta A0 tasolle C2 opiskelijana, opettajana tai vapaana käyttäjänä.',
  alternates: { canonical: '/' },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'OpiOpe',
  url: siteOrigin(),
  inLanguage: ['fi', 'sv'],
}

export default function HomePage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c') }} />
    <CourseGateway />
  </>
}
