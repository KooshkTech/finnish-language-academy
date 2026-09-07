import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Omat tiedot',
  robots: { index: false, follow: false },
}

export default function PrivacyAccountLayout({ children }: { children: React.ReactNode }) {
  return children
}
