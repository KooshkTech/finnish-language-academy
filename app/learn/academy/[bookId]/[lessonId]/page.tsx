import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AcademyLessonPlayer from '@/components/academy/AcademyLessonPlayer'
import { academyLessons, getAcademyLesson } from '@/data/academy-lessons'

export async function generateMetadata({ params }: { params: Promise<{ bookId: string; lessonId: string }> }): Promise<Metadata> {
  const { bookId, lessonId } = await params
  const lesson = getAcademyLesson(lessonId)
  if (!lesson || lesson.bookId !== bookId || !lesson.published) notFound()
  const title = `${lesson.title} — ${lesson.level} suomen oppitunti`
  const description = `OpiOpe ${lesson.level}: ${lesson.topic}. Lukeminen, kuuntelu, kielioppi, puhuminen, kirjoittaminen ja kertaus.`
  const url = `/learn/academy/${bookId}/${lessonId}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, locale: 'fi_FI', type: 'website' }, twitter: { card: 'summary', title, description } }
}
export default async function AcademyLessonPage({params}:{params:Promise<{bookId:string;lessonId:string}>}){const {bookId,lessonId}=await params;const lesson=getAcademyLesson(lessonId);if(!lesson||lesson.bookId!==bookId)notFound();const path=academyLessons.filter(item=>item.published && (bookId.startsWith('fi-')?item.bookId.startsWith('fi-'):item.bookId===bookId));const next=path[path.findIndex(item=>item.id===lessonId)+1];return <AcademyLessonPlayer key={lesson.id} lesson={lesson} nextLesson={next ? {title:next.title,href:`/learn/academy/${next.bookId}/${next.id}`} : undefined}/>}
