import fs from 'node:fs'
for(const file of ['app/teacher/classes/[classId]/attendance/page.tsx','app/api/teacher/classes/[classId]/attendance.csv/route.ts']){const text=fs.readFileSync(file,'utf8');for(const token of ['class_attendance','checkTeacherAccess','teacher_id'])if(!text.includes(token)){console.error(`Missing ${token}: ${file}`);process.exit(1)}}
const csvRoute=fs.readFileSync('app/api/teacher/classes/[classId]/attendance.csv/route.ts','utf8');for(const token of ['text/csv','content-disposition','private, no-store','csvCell','unmarked'])if(!csvRoute.includes(token))process.exit(1)
console.log('V24.22 attendance reports audit passed.')

