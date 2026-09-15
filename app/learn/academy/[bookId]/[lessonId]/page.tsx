import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AcademyLessonPlayer from '@/components/academy/AcademyLessonPlayer'
import { getAcademyLesson } from '@/data/academy-lessons'

export async function generateMetadata({params}:{params:Promise<{bookId:string;lessonId:string}>}):Promise<Metadata>{const {bookId,lessonId}=await params;const lesson=getAcademyLesson(lessonId);if(!lesson||lesson.bookId!==bookId)return{};return{title:`${lesson.title} — ${lesson.level} Finnish lesson`,description:`OPIOPE ${lesson.level} lesson: ${lesson.topic}. Reading, listening, grammar, speaking, writing and mastery practice.`,alternates:{canonical:`/learn/academy/${bookId}/${lessonId}`}}}
export default async function AcademyLessonPage({params}:{params:Promise<{bookId:string;lessonId:string}>}){const {bookId,lessonId}=await params;const lesson=getAcademyLesson(lessonId);if(!lesson||lesson.bookId!==bookId)notFound();return <AcademyLessonPlayer lesson={lesson}/>}

