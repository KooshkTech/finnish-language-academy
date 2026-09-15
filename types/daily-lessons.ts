import type { GeneratedLessonDraft } from '@/types/teacher-content'

export type DailyLessonSkill = 'speaking' | 'listening' | 'reading' | 'writing' | 'understanding' | 'vocabulary' | 'yki-test' | 'mixed'
export type DailyLessonAudience = 'public' | 'class' | 'student'
export type DailyLessonStatus = 'scheduled' | 'published' | 'unpublished' | 'archived'

export interface DailyLessonPublication {
  id: string
  draftId: string
  teacherId: string
  slug: string
  language: 'fi' | 'sv'
  cefrLevel: GeneratedLessonDraft['cefrLevel']
  skill: DailyLessonSkill
  title: string
  objective: string
  lesson: GeneratedLessonDraft
  status: DailyLessonStatus
  audience: DailyLessonAudience
  targetClassId: string | null
  targetStudentId: string | null
  publishAt: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

