import fs from 'node:fs'
const required=['supabase/migrations/20260914100000_assignment_notifications.sql','app/api/notifications/read/route.ts','app/api/cron/assignment-reminders/route.ts','components/notifications/NotificationCenter.tsx','components/assignments/AssignmentStatusControls.tsx']
for (const file of required) if(!fs.existsSync(file)){console.error(`Missing ${file}`);process.exit(1)}
const student=fs.readFileSync('app/student/page.tsx','utf8')
const teacher=fs.readFileSync('app/teacher/classes/[classId]/assignments/[assignmentId]/page.tsx','utf8')
if(!student.includes('NotificationCenter')||!student.includes('assignmentStatus')){console.error('Student notifications/deadline status missing');process.exit(1)}
if(!teacher.includes('missingStudents')||!teacher.includes('AssignmentStatusControls')){console.error('Teacher missing-submission/status controls missing');process.exit(1)}
console.log('V24.12 assignment notification/deadline audit passed.')

