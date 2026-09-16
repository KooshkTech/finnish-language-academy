import type { Metadata, Viewport } from 'next'
import './globals.css'
import PrivacyRuntime from '@/components/privacy/PrivacyRuntime'
import { SmartStudyAssistant } from '@/components/smart/SmartStudyAssistant'
import { indexingEnabled, siteOrigin } from '@/lib/seo.mjs'

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: { default: 'OpiOpe – Opi suomea ja ruotsia verkossa', template: '%s | OpiOpe' },
  description: 'Opi käytännön suomea ja aloita ruotsin opiskelu OpiOpessa. Tasotesti, kielioppi, sanasto, työelämän kieli ja tavoitteellinen YKI-harjoittelu.',
  keywords: ['opi suomea', 'suomen kielen kurssi verkossa', 'suomea aloittelijoille', 'YKI harjoittelu', 'suomen kielen kielioppi', 'suomen kielen sanasto', 'puhekieli', 'työelämän suomi', 'lär dig svenska', 'svenska i Finland', 'svenska för arbete'],
  openGraph: { type: 'website', locale: 'fi_FI', siteName: 'OpiOpe', title: 'OpiOpe – Opi suomea ja ruotsia verkossa', description: 'Suomea arkeen, työhön ja YKIin. Ruotsin starttipolku käytännön oppimiseen.' },
  twitter: { card: 'summary_large_image', title: 'OpiOpe – Opi suomea ja ruotsia verkossa', description: 'Opi suomea. Oikeasti.' },
  robots: { index: indexingEnabled(), follow: true },
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f3f1eb', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fi" className="bg-background"><body className="antialiased">{children}<SmartStudyAssistant /><PrivacyRuntime /></body></html>
}
