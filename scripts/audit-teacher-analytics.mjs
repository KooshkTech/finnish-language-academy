import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const analytics = path.join(root, 'app/teacher/classes/[classId]/analytics/page.tsx')
const student = path.join(root, 'app/teacher/students/[studentId]/page.tsx')
const classPage = path.join(root, 'app/teacher/classes/[classId]/page.tsx')

const failures = []
for (const file of [analytics, student, classPage]) {
  if (!fs.existsSync(file)) failures.push(`Missing ${path.relative(root, file)}`)
}

if (!failures.length) {
  const analyticsText = fs.readFileSync(analytics, 'utf8')
  const studentText = fs.readFileSync(student, 'utf8')
  const classText = fs.readFileSync(classPage, 'utf8')
  const required = [
    ['class progress', analyticsText.includes('classProgress')],
    ['class accuracy', analyticsText.includes('classAccuracy')],
    ['assignment average', analyticsText.includes('assignmentAverage')],
    ['attention rules', analyticsText.includes('needsAttention')],
    ['weak skills', analyticsText.includes('weakSkills')],
    ['14-day activity', analyticsText.includes('minutes14')],
    ['student performance summary', studentText.includes('OPISKELIJAN SUORITUSKYKY') && studentText.includes('STUDERANDENS PRESTATION')],
    ['class analytics navigation', classText.includes(`/teacher/classes/${'${classId}'}/analytics`)],
  ]
  for (const [label, ok] of required) if (!ok) failures.push(`Missing ${label}`)
}

if (failures.length) {
  console.error('Teacher analytics audit failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}
console.log('Teacher class analytics and student performance audit passed.')

