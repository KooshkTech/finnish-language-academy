import fs from 'node:fs'
const hub=fs.readFileSync('components/student/StudentAppHub.tsx','utf8');for(const token of ['Kurssit','Luokan syöte','Live-tunnit','Level Up','Viestit','classId','unread'])if(!hub.includes(token)){console.error(`Missing hub token: ${token}`);process.exit(1)}
if(!fs.readFileSync('app/student/page.tsx','utf8').includes('<StudentAppHub'))process.exit(1)
console.log('V24.20 unified student hub audit passed.')

