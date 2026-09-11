import type { ReactNode } from 'react'
import { requireRole } from '@/lib/auth/roles'

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  await requireRole(['teacher', 'admin'])
  return children
}
