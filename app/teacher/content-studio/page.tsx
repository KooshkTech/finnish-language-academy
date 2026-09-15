import { redirect } from 'next/navigation'
import { TeacherContentStudio } from '@/components/teacher/TeacherContentStudio'
import { checkTeacherAccess } from '@/lib/security/teacher'

export const metadata = { title: 'Opettajan sisältöstudio', robots: { index: false, follow: false } }

export default async function TeacherContentStudioPage() {
  const access = await checkTeacherAccess(true)
  if (!access.ok) {
    if (access.reason === 'mfa-required') redirect('/teacher/security')
    redirect('/')
  }
  return <TeacherContentStudio />
}

