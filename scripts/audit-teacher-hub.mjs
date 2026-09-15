import fs from 'node:fs'
const panel=fs.readFileSync('components/teacher/TeacherOperationsSummary.tsx','utf8');for(const token of ['Luokat','Opiskelijat','Tulevat live-tunnit','Lukemattomat'])if(!panel.includes(token)){console.error(`Missing teacher hub token: ${token}`);process.exit(1)}
const page=fs.readFileSync('app/teacher/page.tsx','utf8');for(const token of ['TeacherOperationsSummary','teacher_class_members','class_sessions',"count:'exact'"])if(!page.includes(token)){console.error(`Missing real count integration: ${token}`);process.exit(1)}
console.log('V24.21 unified teacher hub audit passed.')

