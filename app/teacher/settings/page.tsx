import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { TeacherSettingsClient } from '@/components/teacher/TeacherSettingsClient'
import { checkTeacherAccess } from '@/lib/security/teacher'

export const metadata: Metadata = { title: 'Opettajan asetukset', robots: { index: false, follow: false } }

export default async function TeacherSettingsPage() {
  const access = await checkTeacherAccess(true)
  if (!access.ok) {
    if (access.reason === 'mfa-required') redirect('/teacher/security')
    redirect('/')
  }
  return <TeacherSettingsClient />
}

