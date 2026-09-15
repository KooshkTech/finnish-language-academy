import fs from 'node:fs'
for(const file of ['lib/community/feed.ts','app/api/teacher/assignments/route.ts','app/api/teacher/classes/[classId]/sessions/route.ts'])if(!fs.readFileSync(file,'utf8').includes('publishAutomaticFeedPost')){console.error(`Missing feed automation: ${file}`);process.exit(1)}
console.log('V24.18 automated feed audit passed.')

