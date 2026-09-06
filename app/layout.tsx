import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://finnishlanguage.academy'),
  title: { default: 'Finnish Language Academy — Suomi, joka tuntuu omalta.', template: '%s | Finnish Language Academy' },
  description: 'Selkeä, käytännöllinen ja omaan tahtiin etenevä verkkokoulu suomen kielen oppimiseen A0-tasolta YKI-kokeeseen.',
  keywords: ['suomen kielen kurssi', 'opettele suomea', 'YKI-testi', 'Finnish language course', 'Finnish online school'],
  openGraph: { type: 'website', locale: 'fi_FI', siteName: 'Finnish Language Academy', title: 'Suomi, joka tuntuu omalta.', description: 'Suomen kielen koulu omaan tahtiin.' },
  twitter: { card: 'summary_large_image', title: 'Finnish Language Academy', description: 'Suomi, joka tuntuu omalta.' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f3f1eb', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fi" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
