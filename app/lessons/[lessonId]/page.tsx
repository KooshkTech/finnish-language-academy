import { notFound } from 'next/navigation'
import LessonPlayer from '@/components/course/LessonPlayer'
import { findLesson } from '@/data/course-catalog'

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  const found = findLesson(lessonId)
  if (!found || found.course.status !== 'published') notFound()
  return <LessonPlayer lesson={found.lesson} courseId={found.course.id} />
}

