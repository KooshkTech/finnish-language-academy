import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const required=[
  'supabase/migrations/20260914123000_class_communication.sql',
  'app/api/teacher/classes/[classId]/announcements/route.ts',
  'app/api/teacher/classes/[classId]/invitations/route.ts',
  'app/api/teacher/classes/[classId]/messages/route.ts',
  'app/api/student/class-invitations/[token]/accept/route.ts',
  'app/api/student/classes/[classId]/messages/route.ts',
  'app/join-class/invite/[token]/page.tsx',
  'app/student/classes/[classId]/page.tsx',
  'app/teacher/classes/[classId]/messages/[studentId]/page.tsx',
  'components/communication/ClassAnnouncementForm.tsx',
  'components/communication/ClassInvitationForm.tsx',
  'components/communication/ClassMessageComposer.tsx',
]
const missing=required.filter(f=>!fs.existsSync(path.join(root,f)))
if(missing.length){console.error('Missing V24.15 files:',missing.join(', '));process.exit(1)}
const migration=fs.readFileSync(path.join(root,required[0]),'utf8')
for(const token of ['class_invitations','class_announcements','class_messages','class_invitation','class_announcement','class_message']){
  if(!migration.includes(token)){console.error(`Migration missing ${token}`);process.exit(1)}
}
const teacherRoute=fs.readFileSync(path.join(root,'app/api/teacher/classes/[classId]/messages/route.ts'),'utf8')
const studentRoute=fs.readFileSync(path.join(root,'app/api/student/classes/[classId]/messages/route.ts'),'utf8')
if(!teacherRoute.includes("teacher_class_members")||!studentRoute.includes("teacher_class_members")){console.error('Class membership checks missing from messaging routes.');process.exit(1)}
if(!teacherRoute.includes('enforceRateLimit')||!studentRoute.includes('enforceRateLimit')){console.error('Messaging rate limits missing.');process.exit(1)}
console.log('V24.15 class communication audit passed.')

