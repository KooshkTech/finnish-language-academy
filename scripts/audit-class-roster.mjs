import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const required = [
  'components/teacher/TeacherClassCreateForm.tsx',
  'components/teacher/ClassJoinCodeControls.tsx',
  'components/teacher/ClassRosterControls.tsx',
  'app/api/teacher/classes/[classId]/join-code/route.ts',
  'app/api/teacher/classes/[classId]/members/[studentId]/route.ts',
  'app/api/teacher/classes/[classId]/members/[studentId]/move/route.ts',
]
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) throw new Error(`Missing ${rel}`)
}
const classPage = fs.readFileSync(path.join(root, 'app/teacher/classes/[classId]/page.tsx'), 'utf8')
for (const token of ['ClassRosterControls','ClassJoinCodeControls','otherClasses']) {
  if (!classPage.includes(token)) throw new Error(`Class page missing ${token}`)
}
const classesPage = fs.readFileSync(path.join(root, 'app/teacher/classes/page.tsx'), 'utf8')
if (!classesPage.includes('TeacherClassCreateForm')) throw new Error('Teacher class creation form is not wired')
console.log('Teacher class creation, join-code and roster audit passed.')

