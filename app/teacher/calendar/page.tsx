import { redirect } from 'next/navigation'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { TeacherLessonCalendar } from '@/components/teacher/TeacherLessonCalendar'

export const metadata = { title: 'Julkaisukalenteri', robots: { index: false, follow: false } }

export default async function TeacherCalendarPage() {
  const access = await checkTeacherAccess(true)
  if (!access.ok) {
    if (access.reason === 'mfa-required') redirect('/teacher/security')
    redirect('/')
  }
  return <TeacherLessonCalendar language={access.courseLanguage} />
}

