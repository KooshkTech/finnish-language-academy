import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'

const legacyCourseToAcademyBook: Record<string, string> = {
  'fi-a0': 'opiope-1',
  'fi-a1': 'opiope-1',
  'fi-a2': 'opiope-2',
  'fi-b1': 'opiope-3',
  'fi-b2': 'opiope-4',
  'fi-c1': 'opiope-5',
  'fi-c2': 'opiope-6',
}

export default async function LegacyCourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const bookId = legacyCourseToAcademyBook[courseId]
  if (!bookId) notFound()
  redirect(`/learn/academy/${bookId}`)
}

