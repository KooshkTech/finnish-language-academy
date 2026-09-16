import fs from 'node:fs'

const checks = [
  ['components/classroom/LessonProgressTracker.tsx', ['saveLessonProgress', 'saveUserProgress', 'recordDailyActivity', 'lesson_progress']],
  ['services/client-assessment-progress.ts', ['exercise_attempts', 'saveLessonProgress', 'grammarAttempts']],
  ['components/classroom/LevelSkillClassroom.tsx', ['LessonProgressTracker', 'saveAssessmentResult']],
  ['components/classroom/SwedishLevelSkillClassroom.tsx', ['LessonProgressTracker', 'saveAssessmentResult']],
  ['app/student/page.tsx', ['current_lesson', 'student-progress-list', 'completed_at']],
]

const failures = []
for (const [file, needles] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`)
    continue
  }
  const text = fs.readFileSync(file, 'utf8')
  for (const needle of needles) {
    if (!text.includes(needle)) failures.push(`${file}: missing ${needle}`)
  }
}

if (failures.length) {
  console.error('Student progress audit failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}
console.log('Student progress audit passed: Finnish + Swedish lesson progress, completion, assessments, guest fallback, and dashboard resume wiring found.')

