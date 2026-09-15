import fs from 'node:fs';
import path from 'node:path';
const roots=['app','components'];
const blocked=[
  '>Contacts<','>Live Quiz<','>Voice Lab<','>Flashcards<','>Learn<','>Practice<',
  'NEW · OPIOPE ACADEMY','structured books.','Open OPIOPE Academy','Published now:',
  'Start lesson →','Curriculum syllabus · not released','Practice band ',
  'Upload and download tools','Word analyzer practice','Dictionary flashcards','Lexicon assessment',
  'Voice concepts assessment','How Finnish sound length works','Sound cards','<small>ENGLISH</small>',
  'Game rules','Game flashcards','Arcade mastery check','Live Quiz needs Supabase'
];
let hits=[];
for(const root of roots){
  if(!fs.existsSync(root)) continue;
  const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.(ts|tsx)$/.test(e.name)){const s=fs.readFileSync(p,'utf8');for(const term of blocked){if(s.includes(term))hits.push(`${p}: ${term}`)}}}};
  walk(root);
}
if(hits.length){console.error('Learner-facing English audit failed:\n'+hits.join('\n'));process.exit(1)}
console.log('Learner-facing English audit passed for blocked UI phrases.');

