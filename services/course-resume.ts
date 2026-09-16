export type LocalCourseProgress = {
  lessonSlug: string
  courseId: string
  activityIndex: number
  progressPercent: number
  completed: boolean
  updatedAt: string
}

const STORAGE_KEY = 'opiope_course_resume_v1'

type Store = Record<string, LocalCourseProgress>

function readStore(): Store {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Store
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function readLocalCourseProgress(lessonSlug: string) {
  return readStore()[lessonSlug] ?? null
}

export function saveLocalCourseProgress(progress: LocalCourseProgress) {
  if (typeof window === 'undefined') return
  const store = readStore()
  store[progress.lessonSlug] = progress
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function readLatestLocalCourseProgress() {
  return Object.values(readStore())
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] ?? null
}

