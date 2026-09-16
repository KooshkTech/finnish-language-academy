import fs from 'node:fs'
const panel=fs.readFileSync('components/progress/AchievementPanel.tsx','utf8');for(const token of ['lesson_progress','user_accountability','100 XP','500 XP','3 päivän putki','7 päivän putki','Saavuta B1'])if(!panel.includes(token)){console.error(`Missing achievement token: ${token}`);process.exit(1)}
if(!fs.readFileSync('app/student/page.tsx','utf8').includes('<AchievementPanel />'))process.exit(1)
console.log('V24.19 achievements audit passed.')

