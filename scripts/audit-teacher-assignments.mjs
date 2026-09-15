import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
const root=process.cwd()
const required=[
  'components/assignments/TeacherAssignmentForm.tsx',
  'components/assignments/StudentSubmissionForm.tsx',
  'components/assignments/TeacherFeedbackForm.tsx',
  'app/api/teacher/assignments/route.ts',
  'app/api/teacher/assignments/feedback/route.ts',
  'app/api/student/assignments/submit/route.ts',
  'app/student/assignments/[assignmentId]/page.tsx',
  'app/teacher/classes/[classId]/assignments/[assignmentId]/page.tsx',
  'supabase/migrations/20260914080000_teacher_assignments_feedback.sql',
]
const missing=required.filter(file=>!existsSync(join(root,file)))
if(missing.length){console.error('Missing assignment files:',missing.join(', '));process.exit(1)}
const migration=readFileSync(join(root,required.at(-1)),'utf8')
for(const token of ['teacher_assignments','assignment_submissions','enable row level security','revoke insert, update, delete']){
  if(!migration.includes(token)){console.error(`Assignment migration audit failed: ${token}`);process.exit(1)}
}
const student=readFileSync(join(root,'app/student/page.tsx'),'utf8')
const teacher=readFileSync(join(root,'app/teacher/classes/[classId]/page.tsx'),'utf8')
if(!student.includes('/student/assignments/')||!teacher.includes('TeacherAssignmentForm')){console.error('Assignment UI wiring audit failed.');process.exit(1)}
console.log('Teacher assignment/submission/feedback audit passed.')

