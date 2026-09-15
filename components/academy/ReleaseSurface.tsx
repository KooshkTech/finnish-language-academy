'use client'

import { usePathname } from 'next/navigation'

const legacyPaths = new Set(['/', '/learn', '/practice', '/placement-test', '/progress', '/tutor', '/yki', '/privacy', '/terms', '/cookies', '/account/privacy', '/review/academy'])

export default function ReleaseSurface({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const legacyLesson = pathname.startsWith('/learn/') && !pathname.startsWith('/learn/academy')
  return <div className={legacyPaths.has(pathname) || legacyLesson ? 'legacy-academy' : 'v24-release'}>{children}</div>
}
