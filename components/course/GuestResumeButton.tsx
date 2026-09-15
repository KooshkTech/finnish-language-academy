'use client'

import { useRouter } from 'next/navigation'
import { readLatestLocalCourseProgress } from '@/services/course-resume'

export function GuestResumeButton() {
  const router = useRouter()

  function resume() {
    const progress = readLatestLocalCourseProgress()
    if (progress) {
      router.push(`/lessons/${progress.lessonSlug}`)
      return
    }
    document.getElementById('course-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return <button type="button" className="outline-button guest-resume-button" onClick={resume}>Jatka viimeisintä oppituntia →</button>
}

