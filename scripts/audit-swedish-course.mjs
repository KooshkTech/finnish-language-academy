import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const curriculum = fs.readFileSync(path.join(root, 'data/swedish-level-curriculum.ts'), 'utf8')
const classroom = fs.readFileSync(path.join(root, 'components/classroom/SwedishLevelSkillClassroom.tsx'), 'utf8')
const route = fs.readFileSync(path.join(root, 'app/course/[language]/levels/[level]/[skill]/page.tsx'), 'utf8')
const failures = []

for (const level of ['a0','a1','a2','b1','b2','c1','c2']) {
  if (!curriculum.includes(`${level}: {`)) failures.push(`Missing Swedish level seed: ${level.toUpperCase()}`)
}
for (const skill of ['listening','reading','writing','speaking','understanding','vocabulary']) {
  if (!curriculum.includes(`${skill}: { label:`)) failures.push(`Missing Swedish skill definition: ${skill}`)
}
for (const blocked of ['Kuuntelu','Lukeminen','Kirjoittaminen','Puhuminen','Sanasto','Kielioppi','Harjoittele','Muistikortit']) {
  if (curriculum.includes(blocked) || classroom.includes(blocked)) failures.push(`Finnish learner-facing phrase leaked into Swedish course: ${blocked}`)
}
if (!route.includes('SwedishLevelSkillClassroom')) failures.push('Swedish route does not use the real Swedish classroom.')
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('Swedish A0–C2 course audit passed: 7 levels, 6 skills, Swedish classroom routing, no checked Finnish UI leakage.')

