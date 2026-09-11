import { notFound } from 'next/navigation'
import AcademyShell from '@/components/academy/AcademyShell'
import { curriculumBooks, representativeLessons } from '@/data/curriculum'

export function generateStaticParams() {
  return [...curriculumBooks.map(book => ({ slug: book.slug })), ...representativeLessons.map(lesson => ({ slug: lesson.slug }))]
}

export default async function CurriculumRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!curriculumBooks.some(book => book.slug === slug) && !representativeLessons.some(lesson => lesson.slug === slug)) notFound()
  return <AcademyShell mode="learn" />
}
