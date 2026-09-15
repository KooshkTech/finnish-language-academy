import fs from 'node:fs'
const required=[
 'supabase/migrations/20260914150000_class_sessions_attendance.sql',
 'components/teacher/ClassSessionForm.tsx','components/teacher/AttendanceRoster.tsx','components/teacher/SessionStatusControls.tsx',
 'app/api/teacher/classes/[classId]/sessions/route.ts','app/api/teacher/classes/[classId]/sessions/[sessionId]/attendance/route.ts',
 'app/api/teacher/classes/[classId]/sessions/[sessionId]/status/route.ts','app/teacher/classes/[classId]/sessions/[sessionId]/page.tsx'
]
for(const file of required){if(!fs.existsSync(file)){console.error(`Missing ${file}`);process.exit(1)}}
const migration=fs.readFileSync(required[0],'utf8')
for(const token of ['class_sessions','class_attendance','class_session_scheduled','class_session_cancelled']){if(!migration.includes(token)){console.error(`Missing migration token ${token}`);process.exit(1)}}
const classPage=fs.readFileSync('app/teacher/classes/[classId]/page.tsx','utf8')
const studentPage=fs.readFileSync('app/student/classes/[classId]/page.tsx','utf8')
if(!classPage.includes('ClassSessionForm')||!classPage.includes('Avaa tunti ja läsnäolo')){console.error('Teacher class session UI missing');process.exit(1)}
if(!studentPage.includes('Liity live-tunnille')||!studentPage.includes('class_attendance')){console.error('Student live-session UI missing');process.exit(1)}
console.log('V24.16 class sessions and attendance audit passed.')

