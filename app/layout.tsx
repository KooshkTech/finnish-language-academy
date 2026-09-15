import type { Metadata, Viewport } from 'next'
import './globals.css'
import './v24.css'
import PrivacyRuntime from '@/components/privacy/PrivacyRuntime'
import ReleaseSurface from '@/components/academy/ReleaseSurface'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://opiope.fi'),
  title: { default: 'OPIOPE — Finnish from A0 to C2', template: '%s | OPIOPE' },
  description: 'OPIOPE is a structured Finnish learning academy from A0 to C2 with interactive lessons, speaking, listening, grammar, review, and YKI practice.',
  keywords: ['opi suomea', 'suomen kielen kurssi', 'suomen kielen kurssi verkossa', 'suomea aloittelijoille', 'suomen kieli A1', 'suomen kieli A2', 'suomen kieli B1', 'suomen kieli B2', 'YKI harjoittelu', 'YKI valmistautuminen', 'suomen kielen kielioppi', 'suomen kielen sanasto', 'puhekieli', 'työelämän suomi'],
  openGraph: { type: 'website', locale: 'fi_FI', siteName: 'OpiOpe', title: 'OpiOpe – Opi suomea verkossa A0–C2', description: 'Suomea arkeen, työhön ja YKIin.' },
  twitter: { card: 'summary_large_image', title: 'OpiOpe – Opi suomea verkossa A0–C2', description: 'Opi suomea. Oikeasti.' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f3f1eb', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fi" className="bg-background"><body className="antialiased"><ReleaseSurface>{children}</ReleaseSurface><PrivacyRuntime /></body></html>
}
