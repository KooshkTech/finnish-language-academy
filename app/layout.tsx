import type { Metadata, Viewport } from 'next'
import PrivacyRuntime from '@/components/privacy/PrivacyRuntime'
import './globals.css'
import PrivacyRuntime from '@/components/privacy/PrivacyRuntime'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://opiope.fi'),
  title: { default: 'OpiOpe – Opi suomea verkossa A0–C2', template: '%s | OpiOpe' },
  description: 'Opi suomea verkossa OpiOpessa. Harjoittele suomen kieltä A0–C2, kielioppia, sanastoa, puhekieltä, työelämän suomea ja YKI-tehtäviä.',
  keywords: ['opi suomea', 'suomen kielen kurssi', 'suomen kielen kurssi verkossa', 'suomea aloittelijoille', 'suomen kieli A1', 'suomen kieli A2', 'suomen kieli B1', 'suomen kieli B2', 'YKI harjoittelu', 'YKI valmistautuminen', 'suomen kielen kielioppi', 'suomen kielen sanasto', 'puhekieli', 'työelämän suomi'],
  openGraph: { type: 'website', locale: 'fi_FI', siteName: 'OpiOpe', title: 'OpiOpe – Opi suomea verkossa A0–C2', description: 'Suomea arkeen, työhön ja YKIin.' },
  twitter: { card: 'summary_large_image', title: 'OpiOpe – Opi suomea verkossa A0–C2', description: 'Opi suomea. Oikeasti.' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f3f1eb', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fi" className="bg-background"><body className="antialiased">{children}<PrivacyRuntime /></body></html>
}
